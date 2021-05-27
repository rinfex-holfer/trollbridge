import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {colorsCSS, gameConstants} from "../../constants";
import {Evt, subscriptions} from "../../event-bus";
import {MiscFood, TrollLocation} from "../../types";
import {Meat} from "../meat";
import {EntityType} from "../../managers/core/entities";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {O_Text} from "../../managers/core/render/text";

const enum PotState {
    EMPTY = 'EMPTY',
    PREPARING = 'PREPARING',
    READY = 'READY',
}

export class Pot {
    text: O_Text
    sprite: O_AnimatedSprite
    dishSprite: O_Sprite

    state: PotState = PotState.EMPTY

    subs = subscriptions()

    constructor(position: Vec) {
        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'pot',
            x: position.x,
            y: position.y,
            animations:  [
                {framesPrefix: 'empty', repeat: -1, frameRate: 6},
                {framesPrefix: 'full', repeat: -1, frameRate: 6},
            ]
        })
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

        this.setState(PotState.EMPTY);

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    private onTimePassed() {
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

    private setState(state: PotState) {
        this.state = state;
        switch (this.state) {
            case PotState.EMPTY:
                this.sprite.play('empty')
                this.dishSprite.setVisibility(false)
                break;
            case PotState.PREPARING:
                this.sprite.play('full')
                this.dishSprite.setVisibility(false)
                this.setInteractive(false)
                break;
            case PotState.READY:
                this.sprite.play('empty')
                this.dishSprite.setVisibility(true)
                this.setInteractive(true);
                break;
        }
    }

    private eat() {
        this.setState(PotState.EMPTY)
        o_.troll.eat(MiscFood.DISH)
    }

    public getFreePlaceForChosenFood(): Vec {
        return {
            x: this.sprite.x - 30 + 30 * this.chosenFood.length,
            y: this.sprite.y - 70
        }
    }

    isChoosingFood = false
    unsubFromRightClick = stub as () => void

    private startChoosingFood() {
        const freshMeet = o_.entities.get(EntityType.MEAT);
        if (freshMeet.length < gameConstants.FOOD_FOR_DISH) {
            this.showText();
            return
        }

        this.isChoosingFood = true

        o_.lair.mayBeMovedInto(false)
        o_.lair.mayButtonsBeClicked(false)
        this.setInteractive(true)
        o_.bridge.disableInterface()

        freshMeet.forEach(meat => {
            meat.setChoosable(this)
        })

        this.unsubFromRightClick = o_.interaction.onRightClick(() => {
            this.stopChoosingFood()
        })
    }

    public choseThisFood(food: Meat) {
        this.chosenFood.push(food)
        if (this.chosenFood.length === gameConstants.FOOD_FOR_DISH) {
            const chosenFood = [...this.chosenFood];
            chosenFood.forEach(f => f.updateRealPosition())
            this.stopChoosingFood()
            this.prepare(chosenFood)
        }
    }

    private prepare(meat: Meat[]) {
        this.setInteractive(false)
        const promises = [] as Promise<any>[];

        meat.forEach(m => {
            m.onLastAnimation()
            const flyTarget = {x: this.sprite.x, y: this.sprite.y - 30}
            promises.push(m.flyTo(flyTarget, 50, 500).then(() => m.destroy()))
        })
        Promise.all(promises).then(() => {
            this.setState(PotState.PREPARING);
        })
    }

    private stopChoosingFood() {
        this.unsubFromRightClick()
        o_.lair.updateMayBeMovedInto()
        o_.lair.mayButtonsBeClicked(true)
        o_.bridge.updateMayBeMovedInto()

        o_.entities.get(EntityType.MEAT).forEach(meat => {
            meat.setNotChoosable()
        })

        this.isChoosingFood = false
        this.chosenFood = [];
    }

    chosenFood: Meat[] = []

    removeChosen(food: Meat) {
        findAndSplice(this.chosenFood, food)
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    interruptChoosing() {
        [...this.chosenFood].forEach(f => f.unchoose())
        this.stopChoosingFood();
    }

    onClick() {
        switch (this.state) {
            case PotState.EMPTY:
                if (this.isChoosingFood) this.interruptChoosing()
                else this.startChoosingFood()
                break;
            case PotState.PREPARING:
                break;
            case PotState.READY:
                this.eat()
                break;
        }
    }
}