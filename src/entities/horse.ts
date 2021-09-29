import {o_} from "../managers/locator";
import {CharAnimation} from "./char/char-constants";
import {O_AnimatedSprite} from "../managers/core/render/animated-sprite";
import {gameConstants} from "../constants";


export class Horse {
    sprite: O_AnimatedSprite

    constructor(x: number, y: number) {
        const sprite = o_.render.createAnimatedSprite({
            atlasKey: 'horse',
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
            ],
            x,
            y,
        })
        sprite.setOrigin(0.5, 1)
        sprite.addPhysics()

        this.sprite = sprite

        this.runAway()
    }

    runAway() {
        this.sprite.play(CharAnimation.WALK);

        o_.render.moveTowards(this.sprite, o_.bridge.pos.x + o_.bridge.pos.width, this.sprite.y, gameConstants.horse.speed)

        setTimeout(() => {
            this.sprite.destroy()
        }, 5000)
    }
}