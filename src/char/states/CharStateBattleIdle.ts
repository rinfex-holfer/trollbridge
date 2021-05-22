import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";

export class CharStateBattleIdle extends CharState {
    key = CharStateKey.BATTLE_IDLE

    onStart() {
        this.char.setAnimation(CharAnimation.IDLE);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.BATTLE_HIT
        ])
        this.char.hpIndicator.show()
        this.char.mpIndicator.show()
    }

    update(dt: number) {
        if (this.char.hp <= 0 || this.char.morale <= 0) {
            this.char.surrender();
        }
    }
}