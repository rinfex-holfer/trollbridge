import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {gameConstants} from "../../../configs/constants";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {Char} from "../char";

export class CharStateGoTo extends CharState {
    key = CharStateKey.GO_TO

    target: Vec
    speed: number

    constructor(host: Char, options: {target: Vec, speed?: number}) {
        super(host);
        this.target = options.target
        this.speed = options.speed || gameConstants.CHAR_VERY_FAST
    }

    onStart() {
        this.char.speed = this.speed
        this.char.setAnimation(CharAnimation.WALK);
        this.char.directToTarget(this.target)
        this.char.moveTowards(this.target.x, this.target.y);
    }

    update(dt: number) {
        const step = (this.char.speed / 1000) * dt
        const distanceLeft = getDistanceBetween(this.char.container, this.target);
        this.char.moveTowards(this.target.x, this.target.y);

        if (distanceLeft <= step) {
            this.char.stop();
            this.char.container.x = this.target.x
            this.char.container.y = this.target.y
            this.char.setState(CharStateKey.IDLE)
        }
    }
}