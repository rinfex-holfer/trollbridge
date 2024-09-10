import {rnd, rnd2, rndBetween, Vec} from "../../../utils/utils-math";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {o_} from "../../../managers/locator";
import {colorsNum, gameConstants} from "../../../configs/constants";
import {Evt, eventBusSubscriptions} from "../../../event-bus";
import {positioner} from "../../../managers/game/positioner";
import {Pot, PotState} from "../../buildings/pot";
import {LayerKey} from "../../../managers/core/layers";
import {SOUND_KEY} from "../../../managers/core/audio";
import {ImageKey} from "../../../utils/utils-types";
import {FoodType} from "../../../types";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {GoldLocation} from "../gold";
import {foodConfig} from "../../../configs/food-config";
import {destroyInteractiveObjWithFade, destroyInteractiveObjWithJump} from "../../../helpers";
import {debugExpose} from "../../../utils/utils-misc";
import {EffectRotten} from "../../../effects/rotten";
import {ItemType} from "../types";
import {BaseItem} from "../base-item/base-item";
import {EffectHighlight} from "../../../effects/highlight";
import {EffectType} from "../../../effects/types";


export const MEAT_WIDTH = 50;

export class Dish extends BaseItem<ItemType.DISH> {
    type: ItemType.DISH = ItemType.DISH
    id: string

    sprite: O_Sprite

    timePassed = 0

    data = {
        isHuman: false,
        isStale: false,
    }

    constructor(pos: Vec, isHuman = false, isStale = false) {
        super()
        this.id = this.register()

        this.data.isHuman = isHuman
        this.data.isStale = isStale

        this.sprite = o_.render.createSprite('dish', pos.x, pos.y)

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)

        this.globalEventsSubscripions.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }


    eat() {
        if (this.destroyed) {
            console.error("cant eat destroyed dish")
            return
        }
        o_.troll.eat(FoodType.DISH, this.data.isStale, this.data.isHuman)
        this.destroy()
    }

    becomeRotten() {
        this.addEffect(new EffectRotten(this))
        this.data.isStale = true
        this.timePassed = 0
    }

    private onTimePassed() {
        this.timePassed++;

        if (!this.data.isStale && this.timePassed > foodConfig.FRESH_DISH_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.data.isStale && this.timePassed > foodConfig.STALE_DISH_TIME_LIMIT) {
            this.timePassed = 0
            destroyInteractiveObjWithFade(this)
        }
    }

    onDestroyed() {
    }
}
