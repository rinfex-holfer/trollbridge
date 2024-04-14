import {O_Sprite} from "../../managers/core/render/sprite";
import {o_} from "../../managers/locator";
import {positioner} from "../../managers/game/positioner";

export class Ladder {
    sprite: O_Sprite

    constructor() {
        const position = positioner.getLadderBottomPosition()
        this.sprite = o_.render.createSprite('ladder', position.x, position.y)
        // this.sprite.setOrigin(0, 0)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.setHeight(300)
        this.sprite.onClick(() => this.onClick())
    }

    setEnabled(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {

    }
}