import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../char/char-constants";

export class TrollStateIdle extends TrollState {
    key = TrollStateKey.IDLE

    onStart() {
        this.host.stop();
        this.host.setAnimation(CharAnimation.IDLE);
    }
}