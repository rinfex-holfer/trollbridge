import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";

type ClimbOptions = {
    target: Vec
    onStart?: () => void
    onEnd?: () => void
}

export class TrollStateClimb extends TrollState {
    key = TrollStateKey.CLIMB

    options: ClimbOptions

    minDistance = 10

    constructor(host: Troll, options: ClimbOptions) {
        super(host);
        this.options = options
    }

    onStart() {
        this.host.setAnimation(CharAnimation.WALK)
        this.host.moveTowards(this.options.target.x, this.options.target.y, false)

        this.options.onStart?.()

        this.checkDistance()
    }

    onEnd() {
        this.options.onEnd?.()
    }

    checkDistance() {
        const distanceLeft = getDistanceBetween(this.host.container, this.options.target);

        if (distanceLeft <= this.minDistance) {
            this.host.goIdle()
        }
    }

    update(dt: number) {
        this.host.moveTowards(this.options.target.x, this.options.target.y)
        this.checkDistance()
    }
}