import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {o_} from "../../../managers/locator";

export class CharStateBattleIdle extends CharState {
    key = CharStateKey.BATTLE_IDLE

    onStart() {
        this.char.setAnimation(CharAnimation.IDLE);

        this.char.updateActionButtons()

        this.char.hpIndicator.show()
        this.char.mpIndicator.show()
    }

    update(dt: number) {
        if (this.char.hp <= 0 || this.char.morale <= 0) {
            this.char.surrender();
        }
    }

    getPossibleTrollActions(): CharAction[] {
        return [CharAction.BATTLE_HIT, CharAction.BATTLE_THROW_CHAR, CharAction.BATTLE_THROW_ROCK]
    }
}