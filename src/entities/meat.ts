import {rnd, Vec} from "../utils/utils-math";
import {O_Sprite} from "../managers/core/render/sprite";
import {o_} from "../managers/locator";
import {colorsNum, gameConstants} from "../constants";
import {Evt, subscriptions} from "../event-bus";
import {positioner} from "../managers/game/positioner";
import {EntityType, GameEntity} from "../managers/core/entities";
import {Pot} from "./buildings/pot";
import {LayerKey} from "../managers/core/layers";
import {SOUND_KEY} from "../managers/core/audio";
import {ImageKey} from "../utils/utils-types";
import {FoodType} from "../types";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {GoldLocation} from "./gold";

export const enum MeatLocation {
    GROUND = 'GROUND',
    STORAGE = 'STORAGE',
    LAIR = 'LAIR',
}

export const meatSprite = {
    ANIMAL: 'meat_raw' as ImageKey,
    HUMAN_HAND: 'meat_human_hand' as ImageKey,
    HUMAN_LEG: 'meat_human_leg' as ImageKey,
}

export class Meat extends GameEntity<EntityType.MEAT> {
    type: EntityType.MEAT = EntityType.MEAT
    id: string

    sprite: O_Sprite
    location: MeatLocation
    destroyed = false
    isStale = false
    isHuman = false

    timePassed = 0

    subs = subscriptions()

    jumpTimeline: Phaser.Tweens.Timeline
    jumpTimelineDirty = false

    pot: Pot | undefined

    realPosition: Vec

    rottenGas: ParticleEmitter

    constructor(pos: Vec, location: MeatLocation = MeatLocation.GROUND, isHuman = false, key: ImageKey = meatSprite.ANIMAL) {
        super()
        this.id = this.register()

        this.location = location;
        this.isHuman = isHuman

        this.sprite = o_.render.createSprite(key, pos.x, pos.y)
        this.sprite.setOrigin(0.5, 0.5)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.onClick(() => {
            if (this.onClick) return this.onClick()
            else this.onClickDefault()
        })
        this.realPosition = this.updateRealPosition()

        this.jumpTimeline = o_.render.createJumpingTimeline(this.sprite)

        this.rottenGas = o_.render.createGreenSmokeEmitter()
        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.subs.on(Evt.ENCOUNTER_STARTED, () => this.updateInteractive())
        this.subs.on(Evt.ENCOUNTER_ENDED, () => this.updateInteractive())

        this.updateInteractive()
    }

   private onClickDefault() {
        switch (this.location) {
            case MeatLocation.GROUND:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.flyTo(positioner.getRandomPlaceForMeat()).then(() => o_.audio.playSound(SOUND_KEY.BONK))
                    this.setLocation(MeatLocation.LAIR)
                }
                break;
            case MeatLocation.STORAGE:
                this.eat()
                break;
            case MeatLocation.LAIR:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.eat()
                }
                break;
        }
    }

    eat() {
        o_.troll.eat(FoodType.NORMAL, this.isStale, this.isHuman)
        o_.lair.foodStorage.updateFood();
        this.destroy()
    }

    private onClick: (() => void) | undefined

    private setJumping(val: boolean) {
        if (val) {
            this.jumpTimeline.play()
        }
        else {
            this.jumpTimeline.stop()
            this.jumpTimeline.destroy()
            this.jumpTimeline = o_.render.createJumpingTimeline(this.sprite)
            this.sprite.move(this.realPosition.x, this.realPosition.y)
        }
    }

    private becomeRotten() {
        this.isStale = true
        this.timePassed = 0
        this.updateEmitters()
        this.rottenGas.active = true
        this.sprite.obj.setTint(colorsNum.ROTTEN)
        // this.rottenGas.start()
    }

    private updateEmitters() {
        const parentX = this.sprite.obj.parentContainer?.x || 0
        const parentY = this.sprite.obj.parentContainer?.y || 0
        this.rottenGas.setPosition(
            {min: this.sprite.obj.x - 10 + parentX, max: this.sprite.x + 10 + parentX},
            {min: this.sprite.y - 10 + parentY, max: this.sprite.y + 10 + parentY},
        )
    }

    private onTimePassed() {
        this.timePassed++;
        if (this.location !== MeatLocation.STORAGE) {
            this.timePassed += 2;
            if (rnd() > 0.9) return this.destroy()
        }

        if (!this.isStale && this.timePassed > gameConstants.RAW_MEAT_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.isStale && this.timePassed > gameConstants.STALE_MEAT_TIME_LIMIT) {
            this.destroy()
        }
    }

    updateRealPosition() {
        this.realPosition = {x: this.sprite.x, y: this.sprite.y}
        return this.realPosition
    }

    setChoosable(pot: Pot) {
        this.updateRealPosition()
        this.pot = pot;
        this.onClick = () => this.setChosen()
        this.setJumping(true)
        this.setInteractive(true)
    }

    setChosen() {
        if (!this.pot) throw Error('cant choose food without pot')
        this.setJumping(false)
        if (this.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.remove(this.sprite)

        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)
        const newCoord = this.pot.getFreePlaceForChosenFood();
        this.sprite.move(newCoord.x, newCoord.y)
        this.pot.choseThisFood(this)

        this.onClick = () => this.unchoose()
        this.updateEmitters()
    }

    unchoose() {
        if (!this.pot) throw Error('cant un-choose food without pot')
        this.pot.removeChosen(this)
        if (this.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.add(this.sprite)
        this.sprite.move(this.realPosition.x, this.realPosition.y)
        this.onClick = () => this.setChosen()
        this.setJumping(true)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.updateEmitters()
    }

    setNotChoosable() {
        this.setJumping(false)
        this.onClick = undefined
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
    }

    onLastAnimation() {
        this.setJumping(false)
        this.setInteractive(false)
        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)
    }

    public setInteractive(val: boolean) {
        this.sprite.setInteractive(val, {cursor: 'pointer'})
    }

    public updateInteractive() {
        this.setInteractive(
            !o_.battle.isBattle &&
            !o_.negotiations.getIsNegotiationsInProgress()
        )
    }

    public setLocation(loc: MeatLocation) {
        this.location = loc;
    }

    public flyTo(pos: Vec, speed = 1000, maxDuration = 500): Promise<any> {
        if (this.rottenGas.active) this.rottenGas.pause()
        if (this.location === MeatLocation.STORAGE && this.sprite.obj.parentContainer === o_.lair.foodStorage.container.obj) {
            o_.lair.foodStorage.container.remove(this.sprite)
            this.sprite.x += o_.lair.foodStorage.container.x
            this.sprite.y += o_.lair.foodStorage.container.y
        }
        return o_.render.flyTo(this.sprite, pos, speed, maxDuration).then(() => {
            this.updateEmitters()
            if (this.rottenGas.active) this.rottenGas.resume()
        });
    }

    public throwTo(pos: Vec) {
        this.setInteractive(false)
        o_.render.thrownTo(this.sprite, pos, 700).then(() => this.setInteractive(true))
    }

    destroy() {
        this.deregister()
        this.destroyed = true
        this.rottenGas.remove()
        this.subs.clear()
        this.sprite.destroy()
        o_.lair.foodStorage.updateFood()
    }
}
