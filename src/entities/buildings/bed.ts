import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";

export class Bed {
    sprite: O_Sprite
    constructor(position: Vec) {
        this.sprite = o_.render.createSprite('bed', position.x, position.y)
        // this.sprite.setOrigin(0, 0)
        // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.setWidth(100)
        this.sprite.onClick(() => this.onClick())
    }

    setEnabled(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        o_.troll.goToBed();
    }
}