import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateSurrender extends CharState {
    key = CharStateKey.SURRENDER

    onStart(): Promise<any> {
        this.char.setAnimation(CharAnimation.SURRENDER);
        return Promise.resolve();
    }
}