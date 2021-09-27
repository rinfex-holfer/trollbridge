import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {o_} from "../../../managers/locator";

export class CharStateBattleIdle extends CharState {
    key = CharStateKey.BATTLE_IDLE

    onStart() {
        this.char.setAnimation(CharAnimation.IDLE);

        const btns = [CharAction.BATTLE_HIT]
        if (o_.bridge.getRocks().length) btns.push(CharAction.BATTLE_THROW_ROCK)

        this.char.actionsMenu.changeActiveButtons(btns)
        this.char.hpIndicator.show()
        this.char.mpIndicator.show()
    }

    update(dt: number) {
        if (this.char.hp <= 0 || this.char.morale <= 0) {
            this.char.surrender();
        }
    }
}