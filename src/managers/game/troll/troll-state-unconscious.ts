import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../entities/char/char-constants";

export class TrollStateUnconscious extends TrollState {
    key = TrollStateKey.UNCONSCIOUS

    onStart() {
        this.host.setAnimation(CharAnimation.UNCONSCIOUS);
    }

    onEnd() {
        if (this.host.hp === 0) this.host.heal(1)
    }
}