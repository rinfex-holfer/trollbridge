import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateIdle extends CharState {
    key = CharStateKey.IDLE

    onStart() {
        this.char.setAnimation(CharAnimation.IDLE);
        this.char.stop()
    }
}