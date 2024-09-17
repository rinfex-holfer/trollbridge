import {Vec} from "../../../utils/utils-math";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {o_} from "../../../managers/locator";
import {Evt} from "../../../event-bus";
import {LayerKey} from "../../../managers/core/layers";
import {FoodType} from "../../../types";
import {foodConfig} from "../../../configs/food-config";
import {destroyInteractiveObjWithFade} from "../../../helpers";
import {EffectRotten} from "../../../effects/rotten";
import {ItemType} from "../types";
import {BaseItem} from "../base-item/base-item";
import {EffectHighlight} from "../../../effects/highlight";
import {EffectType} from "../../../effects/types";

const WIDTH = 100;

export interface DishData {
    isHuman: boolean,
    isStale: boolean,
    timePassed: number,
    position: Vec
}

export class Dish extends BaseItem<ItemType.DISH> {
    type: ItemType.DISH = ItemType.DISH
    id: string

    sprite: O_Sprite

    data = {
        isHuman: false,
        isStale: false,
        timePassed: 0,
        position: {x: 0, y: 0},
    }

    constructor(data: Partial<DishData>) {
        super()
        this.id = this.register()

        this.data = {
            ...this.data,
            ...data
        }

        this.sprite = o_.render.createSprite('dish', this.data.position.x, this.data.position.y)
        this.sprite.setWidth(WIDTH)

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)

        this.updateRottenEffect()

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
        this.data.isStale = true
        this.data.timePassed = 0
        this.updateRottenEffect()
    }

    updateRottenEffect() {
        if (this.data.isStale && this.getEffect(EffectType.ROTTEN) === undefined) {
            this.addEffect(new EffectRotten(this))
        }
    }

    private onTimePassed() {
        this.data.timePassed++;

        if (!this.data.isStale && this.data.timePassed > foodConfig.FRESH_DISH_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.data.isStale && this.data.timePassed > foodConfig.STALE_DISH_TIME_LIMIT) {
            this.data.timePassed = 0
            destroyInteractiveObjWithFade(this)
        }
    }

    onDestroyed() {
    }
}
