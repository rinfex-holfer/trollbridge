import {o_} from "../managers/locator";
import {CharAnimation} from "./char/char-constants";
import {O_AnimatedSprite} from "../managers/core/render/animated-sprite";
import {gameConstants} from "../configs/constants";
import {Vec} from "../utils/utils-math";
import {Char} from "./char/char";


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
    }

    public runAway() {
        this.sprite.play(CharAnimation.WALK);

        this.runTo({x :o_.bridge.pos.x + o_.bridge.pos.width, y: this.sprite.y})
            .then(() => this.sprite.destroy())
    }

    public runToChar(char: Char) {
        return this.runTo({x: char.container.x, y: char.container.y})
            .then(() => {
                this.sprite.destroy()
            })
    }

    private runTo(pos: Vec) {
        this.sprite.play(CharAnimation.WALK);
        o_.render.directToTarget(this.sprite, pos)
        return o_.render.moveTo(this.sprite, pos, gameConstants.horse.speed).promise
    }
}