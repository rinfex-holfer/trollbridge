import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {colorsCSS} from "../../configs/constants";
import {eventBus, eventBusSubscriptions, Evt} from "../../event-bus";
import {Meat} from "../items/meat/meat";
import {createId, findAndSplice} from "../../utils/utils-misc";
import {O_Text} from "../../managers/core/render/text";
import {SOUND_KEY} from "../../managers/core/audio";
import {foodConfig} from "../../configs/food-config";

import {ItemType} from "../items/types";
import {Dish} from "../items/dish/dish";
import {positioner} from "../../managers/game/positioner";
import {BaseItemEvent} from "../items/base-item/types";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";
import {goldConfig} from "../../configs/gold-config";
import {Txt} from "../../translations";
import {BedData} from "./bed";
import {EffectToTypeMap, EffectType} from "../../effects/types";
import {EntityEffect} from "../../effects/entity-effect";
import {EffectHighlight} from "../../effects/highlight";

export const enum PotState {
    NOT_EXIST = 'NOT_EXIST',
    EMPTY = 'EMPTY',
    PREPARING = 'PREPARING',
    READY = 'READY',
}

type PotComponent = {
    state: PotState,
    timePassed: number,
    ingridientsContainHumanMeat: boolean,
    ingridientsAreStale: boolean,
}

export type PotData = {
    id: string,
    cmp?: {
        upgradable?: UpgradableComponentData
        pot?: PotComponent
    }
}

export class Pot {
    id: string

    text: O_Text

    sprite: O_AnimatedSprite

    subs = eventBusSubscriptions()

    dish?: Dish

    textShowTimeout: any
    chosenFood: Meat[] = []

    private effects: Partial<EffectToTypeMap> = {}

    cmp: {
        upgradable: UpgradableComponent
        pot: PotComponent
    }

    constructor(props?: Partial<PotData>) {
        this.id = props?.id || createId('pot')

        this.sprite = this.createSprite()

        this.text = o_.render.createText({
            textKey: Txt.NotEnoughMeat,
            x: this.sprite.x,
            y: this.sprite.y - 60,
            style: {color: colorsCSS.WHITE}
        })
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_BUTTONS)

        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {x: this.sprite.x, y: this.sprite.y},
                titleTextKey: Txt.UpgradePotTitle,
                descriptionTextKey: Txt.UpgradePotDescr,
                getUpgradeCost: this.getUpgradeCost,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level: 0,
                ...props?.cmp?.upgradable,
            }),
            pot: {
                state: PotState.NOT_EXIST,
                timePassed: 0,
                ingridientsContainHumanMeat: false,
                ingridientsAreStale: false,
                ...props?.cmp?.pot
            }
        }

        this.cmp.upgradable.init()

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.setState(this.cmp.pot.state);
    }

    protected getEffect(type: EffectType): EffectToTypeMap[EffectType] | undefined {
        return this.effects[type]
    }

    protected addEffect<T extends keyof EffectToTypeMap>(effect: EntityEffect<T>) {
        // @ts-ignore
        this.effects[effect.type] = effect
        return effect
    }

    private _canBeUpgraded = () => {
        return this.cmp.pot.state === PotState.NOT_EXIST
    }

    getUpgradeCost = () => {
        return goldConfig.costs.pot
    }

    createSprite(): O_AnimatedSprite {
        const position = positioner.getPotPosition()
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
        this.sprite.onClick(() => this.onClick())
        this.sprite.onPointerOver(() => this.onPointerOver())
        this.sprite.onPointerOut(() => this.onPointerOut())

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.setInteractive(true)

        return this.sprite
    }

    private _upgrade = () => {
        this.setState(PotState.EMPTY)
        this.cmp.upgradable.level = 1
    }

    private onTimePassed() {
        if (this.cmp.pot.state === PotState.PREPARING) {
            this.setState(PotState.READY);
        }
    }

    showText() {
        this.text.setVisibility(true)
        clearTimeout(this.textShowTimeout)
        this.textShowTimeout = setTimeout(() => this.text.setVisibility(false), 3000)
    }

    getData(): PotData {
        return {
            id: this.id,
            cmp: {
                upgradable: this.cmp.upgradable.getData(),
                pot: this.cmp.pot
            },
        }
    }

    onPointerOver() {

    }

    onPointerOut() {

    }

    private setState = (state: PotState) => {
        const prevState = this.cmp.pot.state
        this.cmp.pot.state = state;
        switch (state) {
            case PotState.NOT_EXIST:
                this.sprite.setVisibility(false)
                this.removeDish()
                this.cmp.pot.ingridientsContainHumanMeat = false
                this.cmp.pot.ingridientsAreStale = false
                break;
            case PotState.EMPTY:
                this.sprite.setVisibility(true)
                this.sprite.play('empty')
                this.removeDish()
                this.cmp.pot.ingridientsContainHumanMeat = false
                this.cmp.pot.ingridientsAreStale = false
                break;
            case PotState.PREPARING:
                eventBus.emit(Evt.FOOD_PREPARATION_STARTED)
                this.sprite.setVisibility(true)
                this.sprite.play('full')
                this.removeDish()
                break;
            case PotState.READY:
                this.sprite.setVisibility(true)
                this.cmp.pot.ingridientsContainHumanMeat = false
                this.cmp.pot.ingridientsAreStale = false
                this.sprite.play('empty')

                if (prevState === PotState.PREPARING) {
                    o_.render.burstYellow(this.sprite.x, this.sprite.y)
                    const dish = new Dish({
                        position: {
                            x: this.sprite.x,
                            y: this.sprite.y - 175
                        },
                        isStale: this.cmp.pot.ingridientsAreStale,
                        isHuman: this.cmp.pot.ingridientsContainHumanMeat
                    },);
                    this.addDish(dish)
                } else {
                    // initial state
                    const dish = o_.items.get(ItemType.DISH)[0]
                    if (dish) {
                        this.addDish(dish)
                    }
                }
                break;
            default:
                throw Error('wrong pot state ' + state)
        }
    }

    addDish(dish: Dish) {
        this.dish = dish
        this.dish?.eventEmitter.once(BaseItemEvent.DESTROYED, () => {
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
            y: this.sprite.y - 200
        }
    }

    public choseThisFood(food: Meat) {
        food.moveToPreparationPlace(this.getFreePlaceForChosenFood())

        o_.audio.playSound(SOUND_KEY.PICK)
        this.chosenFood.push(food)
        if (this.chosenFood.length === foodConfig.FOOD_FOR_DISH) {
            this.chosenFood.forEach(f => f.updateRealPosition())
            this.startPreparingChosenFood()
            this.stopChoosingFood()
        } else {
            food.setOnClick(this.unchooseFood)
        }
    }

    private startPreparingChosenFood() {
        this.setInteractive(false)
        const promises = [] as Promise<any>[];

        o_.audio.playSound(SOUND_KEY.COLLECT)

        this.chosenFood.forEach(food => {
            if (food.data.isStale) this.cmp.pot.ingridientsAreStale = true
            if (food.data.isHuman) this.cmp.pot.ingridientsContainHumanMeat = true
            food.onLastAnimation()
            const flyTarget = {x: this.sprite.x, y: this.sprite.y - 30}
            promises.push(food.flyTo(flyTarget, 50, 500).then(() => {
                food.destroy()
            }))
        })
        Promise.all(promises).then(() => {
            o_.audio.playSound(SOUND_KEY.BUBBLE)
            this.setState(PotState.PREPARING);
        })
    }

    startChoosingFood() {
        o_.items.get(ItemType.MEAT).forEach(this.makeFoodChoosable)
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
        o_.items.get(ItemType.MEAT).forEach(this.makeFoodUnchoosable)
        this.chosenFood.forEach(food => food.moveBackToPlaceFromWhereItWasChosen())
        this.chosenFood = [];
    }

    unchooseFood = (food: Meat) => {
        o_.audio.playSound(SOUND_KEY.CANCEL)
        findAndSplice(this.chosenFood, food)
        food.moveBackToPlaceFromWhereItWasChosen()
        this.makeFoodChoosable(food)
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
        if (val === false) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        }
    }

    unchooseAllFood() {
        [...this.chosenFood].forEach(f => f.moveBackToPlaceFromWhereItWasChosen())
        this.chosenFood = []
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_POT_CLICKED, this.cmp.pot.state)
    }
}