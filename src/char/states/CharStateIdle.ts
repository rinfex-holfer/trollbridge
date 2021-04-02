import {CharState, CharStateKey} from "./CharState";

export class CharStateIdle extends CharState {
    key = CharStateKey.IDLE

    onStart(): Promise<any> {
        this.char.setIdleAnimation();
        return Promise.resolve();
    }
}