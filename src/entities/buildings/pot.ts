import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {rnd, Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {colorsCSS, colorsNum, gameConstants} from "../../configs/constants";
import {Evt, subscriptions} from "../../event-bus";
import {FoodType} from "../../types";
import {Meat, MeatLocation} from "../meat";
import {EntityType} from "../../managers/core/entities";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {O_Text} from "../../managers/core/render/text";
import {SOUND_KEY} from "../../managers/core/audio";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {foodConfig} from "../../configs/food-config";

const enum PotState {
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

    subs = subscriptions()

    isDishStale = false
    isDishHuman = false
    timePassed = 0
    rottenGas: ParticleEmitter

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

    private eat() {
        console.log(this.isDishHuman)
        o_.troll.eat(FoodType.DISH, this.isDishStale, this.isDishHuman)
        this.setState(PotState.EMPTY)
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
        if (freshMeet.length < foodConfig.FOOD_FOR_DISH) {
            o_.audio.playSound(SOUND_KEY.CANCEL)
            this.showText();
            return
        }

        o_.audio.playSound(SOUND_KEY.BONK)

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
        o_.audio.playSound(SOUND_KEY.PICK)
        this.chosenFood.push(food)
        if (this.chosenFood.length === foodConfig.FOOD_FOR_DISH) {
            const chosenFood = [...this.chosenFood];
            chosenFood.forEach(f => f.updateRealPosition())
            this.stopChoosingFood()
            this.prepare(chosenFood)
        }
    }

    private prepare(meat: Meat[]) {
        this.setInteractive(false)
        const promises = [] as Promise<any>[];

        o_.audio.playSound(SOUND_KEY.COLLECT)

        meat.forEach(m => {
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

    private stopChoosingFood() {
        o_.audio.playSound(SOUND_KEY.CANCEL)
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
        o_.audio.playSound(SOUND_KEY.CANCEL)
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