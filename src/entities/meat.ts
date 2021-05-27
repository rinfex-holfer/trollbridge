import {rnd, Vec} from "../utils/utils-math";
import {O_Sprite} from "../managers/core/render/sprite";
import {o_} from "../managers/locator";
import {gameConstants} from "../constants";
import {Evt, subscriptions} from "../event-bus";
import {MeatState} from "../types";
import {positioner} from "../managers/game/positioner";
import {EntityType, GameEntity} from "../managers/core/entities";
import {Pot} from "./buildings/pot";
import {LayerKey} from "../managers/core/layers";

export const enum MeatLocation {
    GROUND = 'GROUND',
    STORAGE = 'STORAGE',
    LAIR = 'LAIR',
}


export class Meat extends GameEntity<EntityType.MEAT> {
    type = EntityType.MEAT
    id: string

    sprite: O_Sprite
    location: MeatLocation
    destroyed = false
    isStale = false

    timePassed = 0

    subs = subscriptions()

    jumpTimeline: Phaser.Tweens.Timeline
    jumpTimelineDirty = false

    pot: Pot | undefined

    realPosition: Vec

    constructor(pos: Vec, location: MeatLocation = MeatLocation.GROUND) {
        super()
        this.id = this.register()

        this.location = location;
        this.sprite = o_.render.createSprite(this.getSpriteKey(), pos.x, pos.y)
        this.sprite.setOrigin(0.5, 0.5)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.onClick(() => {
            if (this.onClick) return this.onClick()
            else this.onClickDefault()
        })
        this.setInteractive(true)
        this.realPosition = this.updateRealPosition()

        this.jumpTimeline = o_.render.createJumpingTimeline(this.sprite)

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    private updateSprite() {
        this.sprite.setTexture(this.getSpriteKey())
    }

    private getSpriteKey() {
        return this.isStale ? 'meat_stale' : 'meat_raw'
    }

   private onClickDefault() {
        switch (this.location) {
            case MeatLocation.GROUND:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.flyTo(positioner.getRandomPlaceForMeat())
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
        o_.troll.eat(this.isStale ? MeatState.STALE : MeatState.RAW)
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

    private onTimePassed() {
        this.timePassed++;
        if (this.location === MeatLocation.GROUND) {
            if (rnd() > 0.5) this.destroy()
            return
        }

        if (!this.isStale && this.timePassed > gameConstants.RAW_MEAT_TIME_LIMIT) {
            this.isStale = true
            this.updateSprite();
            this.timePassed = 0
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
    }

    unchoose() {
        if (!this.pot) throw Error('cant un-choose food without pot')
        this.pot.removeChosen(this)
        if (this.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.add(this.sprite)
        this.sprite.move(this.realPosition.x, this.realPosition.y)
        this.onClick = () => this.setChosen()
        this.setJumping(true)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
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

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val, {cursor: 'pointer'})
    }

    public setLocation(loc: MeatLocation) {
        this.location = loc;
    }

    flyTo(pos: Vec, speed = 1000, maxDuration = 500): Promise<any> {
        if (this.location === MeatLocation.STORAGE && this.sprite.obj.parentContainer === o_.lair.foodStorage.container.obj) {
            o_.lair.foodStorage.container.remove(this.sprite)
            this.sprite.x += o_.lair.foodStorage.container.x
            this.sprite.y += o_.lair.foodStorage.container.y
        }
        return o_.render.flyTo(this.sprite, pos, speed, maxDuration);
    }

    destroy() {
        this.deregister()
        this.destroyed = true
        this.subs.clear()
        this.sprite.destroy()
        o_.lair.foodStorage.updateFood()
    }
}
