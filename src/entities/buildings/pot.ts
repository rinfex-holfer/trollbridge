import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {colorsCSS} from "../../configs/constants";
import {eventBus, eventBusSubscriptions, Evt} from "../../event-bus";
import {Meat} from "../meat/meat";
import {findAndSplice} from "../../utils/utils-misc";
import {O_Text} from "../../managers/core/render/text";
import {SOUND_KEY} from "../../managers/core/audio";
import {foodConfig} from "../../configs/food-config";

import {EntityType} from "../types";
import {Dish} from "../dish/dish";
import {positioner} from "../../managers/game/positioner";
import {BaseEvent} from "../base-entity";

export const enum PotState {
    NOT_EXIST = 'NOT_EXIST',
    EMPTY = 'EMPTY',
    PREPARING = 'PREPARING',
    READY = 'READY',
}

export type PotProps = {
    position: Vec,
    state: PotState,
    timePassed: number,
    ingridientsContainHumanMeat: boolean,
    ingridientsAreStale: boolean,
}

const defaultProps: PotProps = {
    position: positioner.getPotPosition(),
    state: PotState.NOT_EXIST,
    timePassed: 0,
    ingridientsContainHumanMeat: false,
    ingridientsAreStale: false,
}

export class Pot {
    text: O_Text
    sprite: O_AnimatedSprite

    subs = eventBusSubscriptions()

    dish?: Dish

    textShowTimeout: any
    chosenFood: Meat[] = []

    props: PotProps

    constructor(props: Partial<PotProps> = {}) {
        const initialProps: PotProps = {
            ...defaultProps,
            ...props,
        }
        this.props = initialProps

        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'pot',
            x: initialProps.position.x,
            y: initialProps.position.y,
            animations: [
                {framesPrefix: 'empty', repeat: -1, frameRate: 6},
                {framesPrefix: 'full', repeat: -1, frameRate: 6},
            ]
        })
        this.sprite.setWidth(200, true);
        this.sprite.setOrigin(0.5, 1)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.onClick(() => this.onClick())
        this.sprite.onPointerOver(() => this.onPointerOver())
        this.sprite.onPointerOut(() => this.onPointerOut())

        this.text = o_.render.createText('На блюдо нужно 3 единицы мяса', this.sprite.x, this.sprite.y - 60, {color: colorsCSS.WHITE})
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_OBJECTS)

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'Котел', 50, () => this.upgrade())

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.setState(initialProps.state);
    }

    private upgrade() {
        this.setState(PotState.EMPTY)
    }

    private onTimePassed() {
        if (this.props.state === PotState.PREPARING) {
            this.setState(PotState.READY);
        }
    }

    showText() {
        this.text.setVisibility(true)
        clearTimeout(this.textShowTimeout)
        this.textShowTimeout = setTimeout(() => this.text.setVisibility(false), 3000)
    }

    onPointerOver() {

    }

    onPointerOut() {

    }

    private setState(state: PotState) {
        this.props.state = state;
        switch (state) {
            case PotState.NOT_EXIST:
                this.sprite.setVisibility(false)
                this.removeDish()
                this.props.ingridientsContainHumanMeat = false
                this.props.ingridientsAreStale = false
                break;
            case PotState.EMPTY:
                this.sprite.setVisibility(true)
                this.sprite.play('empty')
                this.removeDish()
                this.props.ingridientsContainHumanMeat = false
                this.props.ingridientsAreStale = false
                break;
            case PotState.PREPARING:
                this.sprite.setVisibility(true)
                this.sprite.play('full')
                this.removeDish()
                break;
            case PotState.READY:
                this.sprite.setVisibility(true)
                o_.render.burstYellow(this.sprite.x, this.sprite.y)
                this.sprite.play('empty')
                this.createDish()
                break;
            default:
                throw Error('wrong pot state ' + state)
        }
    }

    createDish() {
        this.dish = new Dish({
            x: this.sprite.x,
            y: this.sprite.y - 10
        }, this.props.ingridientsContainHumanMeat, this.props.ingridientsAreStale)
        this.props.ingridientsContainHumanMeat = false
        this.props.ingridientsAreStale = false
        this.dish.eventEmitter.once(BaseEvent.DESTROYED, () => {
            this.removeDish()
        })
    }

    removeDish() {
        if (this.dish) {
            if (!this.dish.destroyed) {
                this.dish.destroy()
            }
            this.dish = undefined
        }
    }

    eat() {
        this.dish?.eat()
        this.setState(PotState.EMPTY)
    }

    public getFreePlaceForChosenFood(): Vec {
        return {
            x: this.sprite.x - 30 + 30 * this.chosenFood.length,
            y: this.sprite.y - 70
        }
    }

    public choseThisFood(food: Meat) {
        food.moveToPreparationPlace(this.getFreePlaceForChosenFood())

        o_.audio.playSound(SOUND_KEY.PICK)
        this.chosenFood.push(food)
        if (this.chosenFood.length === foodConfig.FOOD_FOR_DISH) {
            this.chosenFood.forEach(f => f.updateRealPosition())
            this.stopChoosingFood()
            this.startPreparingChosenFood()
        } else {
            food.setOnClick(this.unchooseFood)
        }
    }

    private startPreparingChosenFood() {
        this.setInteractive(false)
        const promises = [] as Promise<any>[];

        o_.audio.playSound(SOUND_KEY.COLLECT)

        this.chosenFood.forEach(food => {
            if (food.props.isStale) this.props.ingridientsAreStale = true
            if (food.props.isHuman) this.props.ingridientsContainHumanMeat = true
            food.onLastAnimation()
            const flyTarget = {x: this.sprite.x, y: this.sprite.y - 30}
            promises.push(food.flyTo(flyTarget, 50, 500).then(() => food.destroy()))
        })
        Promise.all(promises).then(() => {
            o_.audio.playSound(SOUND_KEY.BUBBLE)
            this.setState(PotState.PREPARING);
        })
    }

    startChoosingFood() {
        o_.entities.get(EntityType.MEAT).forEach(this.makeFoodChoosable)
    }

    makeFoodChoosable = (food: Meat) => {
        food.setOnClick(() => {
            this.choseThisFood(food)
        })
        food.setJumping(true)
        food.setInteractive(true)
    }

    makeFoodUnchoosable = (food: Meat) => {
        food.setOnClick(undefined)
        food.setInteractive(false)
        food.setJumping(false)
    }

    stopChoosingFood() {
        o_.entities.get(EntityType.MEAT).forEach(this.makeFoodUnchoosable)
        this.chosenFood.forEach(food => food.moveBackToPlaceFromWhereItWasChosen())
        this.chosenFood = [];
    }

    unchooseFood = (food: Meat) => {
        o_.audio.playSound(SOUND_KEY.CANCEL)
        findAndSplice(this.chosenFood, food)
        food.moveBackToPlaceFromWhereItWasChosen()
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    unchooseAllFood() {
        [...this.chosenFood].forEach(f => f.moveBackToPlaceFromWhereItWasChosen())
        this.chosenFood = []
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_POT_CLICKED, this.props.state)
    }
}