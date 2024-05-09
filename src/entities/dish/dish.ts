import {rnd, rnd2, rndBetween, Vec} from "../../utils/utils-math";
import {O_Sprite} from "../../managers/core/render/sprite";
import {o_} from "../../managers/locator";
import {colorsNum, gameConstants} from "../../configs/constants";
import {Evt, eventBusSubscriptions} from "../../event-bus";
import {positioner} from "../../managers/game/positioner";
import {Pot, PotState} from "../buildings/pot";
import {LayerKey} from "../../managers/core/layers";
import {SOUND_KEY} from "../../managers/core/audio";
import {ImageKey} from "../../utils/utils-types";
import {FoodType} from "../../types";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {GoldLocation} from "../gold";
import {foodConfig} from "../../configs/food-config";
import {destroyInteractiveObjWithFade, destroyInteractiveObjWithJump} from "../../helpers";
import {debugExpose} from "../../utils/utils-misc";
import {EffectRotten} from "../../effects/rotten";
import {GameEntityBase} from "../base-entity";
import {EntityType} from "../types";


export const MEAT_WIDTH = 50;

export class Dish extends GameEntityBase<EntityType.DISH> {
    type: EntityType.DISH = EntityType.DISH
    id: string

    sprite: O_Sprite

    timePassed = 0

    props = {
        isHuman: false,
        isStale: false,
    }

    constructor(pos: Vec, isHuman = false) {
        super()
        this.id = this.register()

        this.props.isHuman = isHuman

        this.sprite = o_.render.createSprite('dish', pos.x, pos.y)
        // o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)

        this.globalEventsSubscripions.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }


    eat() {
        if (this.destroyed) {
            console.error("cant eat destroyed dish")
            return
        }
        o_.troll.eat(FoodType.DISH, this.props.isStale, this.props.isHuman)
        this.destroy()
    }

    becomeRotten() {
        this.addEffect(new EffectRotten(this))
        this.props.isStale = true
        this.timePassed = 0
    }

    private onTimePassed() {
        this.timePassed++;

        if (!this.props.isStale && this.timePassed > foodConfig.FRESH_DISH_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.props.isStale && this.timePassed > foodConfig.STALE_DISH_TIME_LIMIT) {
            this.timePassed = 0
            destroyInteractiveObjWithFade(this)
        }
    }

    onDestroyed() {
    }
}
