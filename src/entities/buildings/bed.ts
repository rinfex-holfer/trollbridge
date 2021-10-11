import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";

export class Bed {
    sprite: O_Sprite

    upgraded = false

    constructor(position: Vec) {
        const spriteKey = this.upgraded ? 'bed_upgraded' : 'bed'
        this.sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // this.sprite.setOrigin(0, 0)
        // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.setWidth(100)
        this.sprite.onClick(() => this.onClick())

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'кровать', 50, () => this.upgrade())
    }

    upgrade() {
        this.sprite.setTexture('bed_upgraded')
        this.upgraded = true
    }

    setEnabled(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        o_.troll.goToBed();
    }
}