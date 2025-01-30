import {O_Sprite} from "../../managers/core/render/sprite";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {BaseItem} from "./base-item/base-item";
import {ItemType} from "./types";
import {EffectHighlight} from "../../effects/highlight";
import {EffectType} from "../../effects/types";


export class Rock extends BaseItem<ItemType.ROCK> {
    type: ItemType.ROCK = ItemType.ROCK
    id: string

    sprite: O_Sprite

    data = {}

    constructor(pos: Vec) {
        super()
        this.id = this.register()

        this.sprite = o_.render.createSprite('rock', pos.x, pos.y)
        this.sprite.setOrigin(0, 0.5)

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.updateLayer()
        this.emitCreatedEvent();
    }

    private updateLayer() {
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
    }

    private onTimePassed() {

    }

    onDestroyed() {
    }

    public throwTo(pos: Vec) {
        return o_.render.thrownTo(this.sprite, pos, 700)
    }
}