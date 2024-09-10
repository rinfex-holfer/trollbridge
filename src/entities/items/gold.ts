import {O_Sprite} from "../../managers/core/render/sprite";
import {rndBetween, Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Evt} from "../../event-bus";
import {resoursePaths} from "../../resourse-paths";
import {SOUND_KEY} from "../../managers/core/audio";
import {goldConfig} from "../../configs/gold-config";
import {BaseItem} from "./base-item/base-item";
import {ItemType} from "./types";
import {EffectHighlight} from "../../effects/highlight";
import {EffectType} from "../../effects/types";
import {debugExpose} from "../../utils/utils-misc";
import {Meat, MeatLocation} from "./meat/meat";

export const enum GoldLocation {
    GROUND = 'GROUND',
    TREASURY = 'TREASURY',
}

export const GOLD_WIDTH = 50

export interface GoldData {
    amount: number
    position: Vec
    location: GoldLocation
}

export class Gold extends BaseItem<ItemType.GOLD> {
    type: ItemType.GOLD = ItemType.GOLD
    id: string

    sprite: O_Sprite

    data = {
        amount: 0,
        position: {x: 0, y: 0},
        location: GoldLocation.GROUND
    }

    constructor(data: GoldData) {
        super()
        this.id = this.register()

        this.data = {
            ...this.data,
            ...data
        }

        this.sprite = o_.render.createSprite(this.getSpriteKey(), this.data.position.x, this.data.position.y)
        this.sprite.setOrigin(0, 0.5)
        this.sprite.setWidth(GOLD_WIDTH)

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.updateLayer()

        if (this.data.location === GoldLocation.GROUND) {
            this.sprite.setInteractive(true)
            this.sprite.onClick(() => this.onClick())
        }
        this.globalEventsSubscripions.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.updateInteractive()
    }

    private onClick() {
        o_.lair.treasury.gatherGold([this])
    }

    public flyToStorage() {
        switch (this.data.location) {
            case GoldLocation.GROUND:
                o_.audio.playSound(SOUND_KEY.PICK_THIN)
                this.sprite.setInteractive(false)
                const lastGoldItem = o_.lair.treasury.gold[o_.lair.treasury.gold.length - 1]
                const coord = (lastGoldItem && lastGoldItem.data.amount < goldConfig.MAX_GOLD_IN_SPRITE)
                    ? lastGoldItem.sprite
                    : o_.lair.treasury.getNextPosition()
                return o_.render.flyTo(this.sprite, coord, 500, 300).then(() => {
                    this.destroy()
                })
                break;
            case GoldLocation.TREASURY:
                return Promise.resolve()
                break;
        }
    }

    public flyTo(pos: Vec) {
        this.sprite.setInteractive(false)
        return o_.render.flyTo(this.sprite, pos, 500, 300)
    }

    private updateSprite() {
        this.sprite.setTexture(this.getSpriteKey())
    }

    private updateLayer() {
        if (this.data.amount < 20) {
            // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
            o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        } else {
            o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        }
    }

    private getSpriteKey(): keyof typeof resoursePaths.images {
        if (this.data.amount === 1) {
            return 'gold-1'
        } else if (this.data.amount === 2) {
            return 'gold-2'
        } else if (this.data.amount === 3) {
            return 'gold-3'
        } else if (this.data.amount < 10) {
            return 'gold-4-9'
        } else if (this.data.amount < 20) {
            return 'gold-some'
        } else if (this.data.amount < 50) {
            return 'gold-many'
        } else if (this.data.amount < goldConfig.MAX_GOLD_IN_SPRITE) {
            return 'gold-almost'
        } else if (this.data.amount === goldConfig.MAX_GOLD_IN_SPRITE) {
            return 'gold-chest'
        } else {
            throw Error('wrong amount of gold ' + this.data.amount)
        }
    }

    private onTimePassed() {
        // if (this.location === GoldLocation.GROUND) this.destroy()
    }

    onDestroyed() {
    }

    public setAmount(amount: number) {
        this.data.amount = amount
        this.updateSprite()
        this.updateLayer()
    }

    public setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
    }

    public updateInteractive() {
        this.setInteractive(
            this.data.location === GoldLocation.GROUND
        )
    }

    public throwTo(pos: Vec) {
        this.setInteractive(false)
        o_.render.thrownTo(this.sprite, pos, 700).then(() => this.updateInteractive())
    }
}

debugExpose((amount?: number) => {
    const x = rndBetween(600, 700);
    const y = rndBetween(1100, 1300);
    amount = amount || rndBetween(1, 100);

    new Gold({
        position: {x, y},
        location: GoldLocation.GROUND,
        amount
    })
}, 'spawnGold')