import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateBattleIdle extends CharState {
    key = CharStateKey.BATTLE_IDLE

    onStart() {
        this.char.setAnimation(CharAnimation.IDLE);

        this.char.hpIndicator.show()
        this.char.mpIndicator.show()
    }
}