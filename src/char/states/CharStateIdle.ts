import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateIdle extends CharState {
    key = CharStateKey.IDLE

    onStart(): Promise<any> {
        this.char.setAnimation(CharAnimation.IDLE);
        return Promise.resolve();
    }
}