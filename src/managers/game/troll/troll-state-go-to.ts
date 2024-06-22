import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";

type GoToOptions = {
    target: Vec
    minDistance?: number
    speed?: number
    turnToTarget?: boolean
    onStart?: () => void
    onEnd?: () => void
    onReached?: () => void
}

export class TrollStateGoTo extends TrollState {
    key = TrollStateKey.GO_TO

    options: GoToOptions

    minDistance: number = 10

    constructor(host: Troll, options: GoToOptions) {
        super(host);
        this.options = options

        this.minDistance = options.minDistance ?? 10
    }

    onStart() {
        this.host.setAnimation(CharAnimation.WALK)
        this.host.moveTowards(this.options.target.x, this.options.target.y)

        this.options.onStart?.()

        this.checkDistance()
    }

    onEnd() {
        this.options.onEnd?.()
    }

    checkDistance() {
        const distanceLeft = getDistanceBetween(this.host.container, this.options.target);

        if (distanceLeft <= this.minDistance) {
            this.options.onReached?.()
            this.host.goIdle()
        }
    }

    update(dt: number) {
        this.host.moveTowards(this.options.target.x, this.options.target.y)
        this.checkDistance()
    }
}