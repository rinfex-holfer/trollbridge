import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";

type JumpOptions = {
    target: Vec
    direction: 'up' | 'down'
    onStart?: () => void
    onEnd?: () => void
}

export class TrollStateJump extends TrollState {
    key = TrollStateKey.JUMP

    options: JumpOptions

    constructor(host: Troll, options: JumpOptions) {
        super(host);
        this.options = options
    }

    onStart() {
        this.host.jumpToLair(this.options.target).then(() => this.host.goIdle())

        this.options.onStart?.()
    }

    onEnd() {
        this.options.onEnd?.()
    }

    update(dt: number) {

    }
}