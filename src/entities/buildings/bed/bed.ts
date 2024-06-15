import {o_} from "../../../managers/locator";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {LayerKey} from "../../../managers/core/layers";
import {Vec} from "../../../utils/utils-math";
import {eventBus, Evt} from "../../../event-bus";

export class Bed {
    sprite: O_Sprite

    upgraded = false

    constructor(position: Vec) {
        const spriteKey = this.upgraded ? 'bed_upgraded' : 'bed'
        this.sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // this.sprite.setOrigin(0, 0)
        // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.setWidth(200, false)
        this.sprite.setHeight(100, false)
        this.sprite.onClick(() => this.onClick())

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'кровать', 50, () => this.upgrade())
    }

    upgrade() {
        this.sprite.setTexture('bed_upgraded')
        this.upgraded = true
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_BED_CLICKED)
    }
}