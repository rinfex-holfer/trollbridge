import {EntityType, GameEntityBase} from "../managers/core/entities";
import {O_Sprite} from "../managers/core/render/sprite";
import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";
import {LayerKey} from "../managers/core/layers";
import {Evt, subscriptions} from "../event-bus";
import {gameConstants} from "../configs/constants";
import {resoursePaths} from "../resourse-paths";
import {SOUND_KEY} from "../managers/core/audio";



export class Rock extends GameEntityBase<EntityType.ROCK> {
    type: EntityType.ROCK = EntityType.ROCK
    id: string

    sprite: O_Sprite

    subs = subscriptions()

    props = {}

    constructor(pos: Vec) {
        super()
        this.id = this.register()

        this.sprite = o_.render.createSprite('rock', pos.x, pos.y)
        this.sprite.setOrigin(0, 0.5)
        // this.sprite.setWidth(32)
        this.updateLayer()
    }

    private updateLayer() {
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
    }

    private onTimePassed() {

    }

    destroy() {
        this.deregister()
        this.subs.clear()
        this.sprite.destroy()
    }

    public throwTo(pos: Vec) {
        return o_.render.thrownTo(this.sprite, pos, 700)
    }
}