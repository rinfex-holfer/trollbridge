import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {colorsCSS, colorsNum} from "../../configs/constants";
import {eventBus, Evt, eventBusSubscriptions} from "../../event-bus";
import {FoodType} from "../../types";
import {Meat} from "../meat/meat";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {O_Text} from "../../managers/core/render/text";
import {SOUND_KEY} from "../../managers/core/audio";
import {foodConfig} from "../../configs/food-config";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;

import {EntityType} from "../types";

export const enum PotState {
    NOT_EXIST = 'NOT_EXIST',
    EMPTY = 'EMPTY',
    PREPARING = 'PREPARING',
    READY = 'READY',
}

export class Pot {
    text: O_Text
    sprite: O_AnimatedSprite
    dishSprite: O_Sprite

    state: PotState = PotState.EMPTY

    subs = eventBusSubscriptions()

    isDishStale = false
    isDishHuman = false
    timePassed = 0
    rottenGas: ParticleEmitter

    constructor(position: Vec) {
        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'pot',
            x: position.x,
            y: position.y,
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

        this.dishSprite = o_.render.createSprite('dish', position.x, position.y - 50)
        o_.layers.add(this.dishSprite, LayerKey.FIELD_BUTTONS)

        this.text = o_.render.createText('На блюдо нужно 3 единицы мяса', this.sprite.x, this.sprite.y - 60, {color: colorsCSS.WHITE})
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_OBJECTS)

        this.rottenGas = o_.render.createGreenSmokeEmitter()
        this.updateEmitters()

        this.setState(PotState.NOT_EXIST);

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'Котел', 50, () => this.upgrade())

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    private upgrade() {
        this.setState(PotState.EMPTY)
    }

    private updateEmitters() {
        // const parentX = this.sprite.obj.parentContainer?.x || 0
        // const parentY = this.sprite.obj.parentContainer?.y || 0
        this.rottenGas.setPosition(
            this.sprite.obj.x,
            this.sprite.y - 50
            // {min: this.sprite.obj.x - 10, max: this.sprite.x + 10},
            // {min: this.sprite.y - 60, max: this.sprite.y - 40},
        )
    }

    private onTimePassed() {
        if (this.state === PotState.READY) {
            this.timePassed++

            if (!this.isDishStale && this.timePassed > foodConfig.RAW_MEAT_TIME_LIMIT) {
                this.becomeRotten()
            } else if (this.isDishStale && this.timePassed > foodConfig.STALE_MEAT_TIME_LIMIT) {
                this.timePassed = 0
                this.setState(PotState.EMPTY)
                return
            }
        } else {
            this.timePassed = 0
        }

        if (this.state === PotState.PREPARING) {
            this.setState(PotState.READY);
        }
    }

    textShowTimeout: any

    showText() {
        this.text.setVisibility(true)
        clearTimeout(this.textShowTimeout)
        this.textShowTimeout = setTimeout(() => this.text.setVisibility(false), 3000)
    }

    onPointerOver() {

    }

    onPointerOut() {

    }

    private becomeRotten() {
        this.isDishStale = true
        this.timePassed = 0
        this.rottenGas.active = true
        this.rottenGas.setVisible(true)
        this.dishSprite.obj.setTint(colorsNum.ROTTEN)
        // this.rottenGas.start()
    }

    private becomeFresh() {
        this.isDishStale = false
        this.timePassed = 0
        this.rottenGas.active = false
        this.rottenGas.setVisible(false)
        this.dishSprite.obj.clearTint()
    }

    private setState(state: PotState) {
        this.state = state;
        switch (state) {
            case PotState.NOT_EXIST:
                this.sprite.setVisibility(false)
                this.dishSprite.setVisibility(false)
                break;
            case PotState.EMPTY:
                this.sprite.setVisibility(true)
                this.sprite.play('empty')
                this.dishSprite.setVisibility(false)
                this.becomeFresh()
                this.isDishHuman = false
                break;
            case PotState.PREPARING:
                this.sprite.play('full')
                this.dishSprite.setVisibility(false)
                this.setInteractive(false)
                break;
            case PotState.READY:
                o_.render.burstYellow(this.sprite.x, this.sprite.y)
                this.sprite.play('empty')
                this.dishSprite.setVisibility(true)
                this.setInteractive(true)
                break;
            default:
                throw Error('wrong pot state ' + state)
        }
    }

    eat() {
        o_.troll.eat(FoodType.DISH, this.isDishStale, this.isDishHuman)
        this.setState(PotState.EMPTY)
    }

    chosenFood: Meat[] = []

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

        this.chosenFood.forEach(m => {
            if (m.props.isStale) this.becomeRotten()
            if (m.props.isHuman) this.isDishHuman = true
            m.onLastAnimation()
            const flyTarget = {x: this.sprite.x, y: this.sprite.y - 30}
            promises.push(m.flyTo(flyTarget, 50, 500).then(() => m.destroy()))
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
        eventBus.emit(Evt.INTERFACE_POT_CLICKED, this.state)
    }
}