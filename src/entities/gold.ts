import {EntityType, GameEntity} from "../managers/core/entities";
import {O_Sprite} from "../managers/core/render/sprite";
import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";
import {LayerKey} from "../managers/core/layers";
import {Evt, subscriptions} from "../event-bus";
import {gameConstants} from "../constants";
import {resoursePaths} from "../resourse-paths";
import {SOUND_KEY} from "../managers/core/audio";

export const enum GoldLocation {
    GROUND = 'GROUND',
    TREASURY = 'TREASURY',
}

export class Gold extends GameEntity<EntityType.GOLD> {
    type: EntityType.GOLD = EntityType.GOLD
    id: string

    location: GoldLocation
    sprite: O_Sprite

    subs = subscriptions()

    amount: number

    constructor(pos: Vec, amount: number, location: GoldLocation = GoldLocation.GROUND) {
        super()
        this.id = this.register()

        this.amount = amount
        this.location = location

        this.sprite = o_.render.createSprite(this.getSpriteKey(), pos.x, pos.y)
        this.sprite.setOrigin(0, 0.5)
        this.sprite.setWidth(32)
        this.updateLayer()

        if (location === GoldLocation.GROUND) {
            this.sprite.setInteractive(true, {cursor: 'pointer'})
            this.sprite.onClick(() => this.onClick())
        }
        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
        this.subs.on(Evt.ENCOUNTER_STARTED, () => this.updateInteractive())
        this.subs.on(Evt.ENCOUNTER_ENDED, () => this.updateInteractive())

        this.updateInteractive()
    }

    private onClick() {
        switch (this.location) {
            case GoldLocation.GROUND:
                o_.audio.playSound(SOUND_KEY.PICK_THIN)
                this.sprite.setInteractive(false)
                const lastGoldItem = o_.lair.treasury.gold[o_.lair.treasury.gold.length - 1]
                const coord = (lastGoldItem && lastGoldItem.amount < gameConstants.MAX_GOLD_IN_SPRITE)
                    ? lastGoldItem.sprite
                    : o_.lair.treasury.getNextPosition()
                o_.render.flyTo(this.sprite, coord, 500, 300).then(() => {
                    o_.lair.treasury.addGold(this.amount)
                    this.destroy()
                })
                break;
            case GoldLocation.TREASURY:
                break;
        }
    }

    private updateSprite() {
        this.sprite.setTexture(this.getSpriteKey())
    }

    private updateLayer() {
        if (this.amount < 20) {
            // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
            o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        } else {
            o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        }
    }

    private getSpriteKey(): keyof typeof resoursePaths.images {
        if (this.amount === 1) {
            return 'gold-1'
        } else if (this.amount === 2) {
            return 'gold-2'
        } else if (this.amount === 3) {
            return 'gold-3'
        } else if (this.amount < 10) {
            return 'gold-4-9'
        } else if (this.amount < 20) {
            return 'gold-some'
        } else if (this.amount < 50) {
            return 'gold-many'
        } else  if (this.amount < gameConstants.MAX_GOLD_IN_SPRITE) {
            return 'gold-almost'
        } else if (this.amount === gameConstants.MAX_GOLD_IN_SPRITE) {
            return 'gold-chest'
        } else {
            throw Error('wrong amount of gold ' + this.amount)
        }
    }

    private onTimePassed() {
        // if (this.location === GoldLocation.GROUND) this.destroy()
    }

    destroy() {
        this.deregister()
        this.subs.clear()
        this.sprite.destroy()
    }

    public setAmount(amount: number) {
        this.amount = amount
        this.updateSprite()
        this.updateLayer()
    }

    public setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
    }

    public updateInteractive() {
        this.setInteractive(
            this.location === GoldLocation.GROUND &&
            !o_.battle.isBattle &&
            !o_.negotiations.getIsNegotiationsInProgress()
        )
    }

    public throwTo(pos: Vec) {
        this.setInteractive(false)
        o_.render.thrownTo(this.sprite, pos, 700).then(() => this.setInteractive(true))
    }
}