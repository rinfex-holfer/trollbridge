import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";

type SitOptions = {
    onStart?: () => void
    onEnd?: () => void
}

export class TrollStateSit extends TrollState {
    key = TrollStateKey.SIT

    options?: SitOptions

    minDistance = 10

    constructor(host: Troll, options?: SitOptions) {
        super(host);
        this.options = options
    }

    onStart() {
        this.host.setAnimation(CharAnimation.SIT)

        this.options?.onStart?.()
        this.host.setLayer('top')
    }

    onEnd() {
        this.options?.onEnd?.()
        this.host.setLayer('normal')
    }

    update(dt: number) {

    }
}