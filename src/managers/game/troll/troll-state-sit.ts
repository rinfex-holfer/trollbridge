import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {Evt} from "../../../event-bus";
import {trollConfig} from "../../../configs/troll-config";

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

        o_.lair.chair.occupied = true

        this.subs.on(Evt.TIME_PASSED, (time) => {
            const hpToAdd = time * Math.ceil(trollConfig.HP_FROM_SIT * this.host.maxHp)
            if (this.host.hunger !== this.host.maxHunger) this.host.heal(hpToAdd)
            this.host.changeSelfControl(trollConfig.SELF_CONTROL_FROM_SIT * time)
        })
    }

    onEnd() {
        this.options?.onEnd?.()
        this.host.setLayer('normal')

        o_.lair.chair.occupied = false
    }

    update(dt: number) {

    }
}