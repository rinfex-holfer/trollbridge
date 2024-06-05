import {O_Sprite} from "../../managers/core/render/sprite";
import {o_} from "../../managers/locator";
import {positioner} from "../../managers/game/positioner";


export class Ladder {
    spriteLeft: O_Sprite
    spriteRight: O_Sprite

    constructor() {
        const [leftBounds, rightBounds] = positioner.getLadderBounds()

        this.spriteLeft = o_.render.createSprite('empty_sprite', leftBounds.x, leftBounds.y)
        this.spriteLeft.setOrigin(0, 0.5)
        this.spriteLeft.setInteractive(true, {cursor: 'pointer'})
        this.spriteLeft.setHeight(leftBounds.height, false)
        this.spriteLeft.setWidth(leftBounds.width, false)

        this.spriteRight = o_.render.createSprite('empty_sprite', rightBounds.x, rightBounds.y)
        this.spriteRight.setOrigin(0, 0.5)
        this.spriteRight.setInteractive(true, {cursor: 'pointer'})
        this.spriteRight.setHeight(rightBounds.height, false)
        this.spriteRight.setWidth(rightBounds.width, false)

        // o_.render.createOutline(this.spriteLeft);
        // o_.render.createOutline(this.spriteRight);

        this.spriteLeft.onClick(() => this.onClick())
    }

    setEnabled(val: boolean) {
        this.spriteLeft.setInteractive(val);
        this.spriteRight.setInteractive(val);
    }

    onClick() {

    }
}