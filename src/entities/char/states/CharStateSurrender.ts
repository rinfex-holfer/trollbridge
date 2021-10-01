import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {gameConstants} from "../../../configs/constants";
import {flyingStatusChange} from "../../../interface/basic/flying-status-change";

export class CharStateSurrender extends CharState {
    key = CharStateKey.SURRENDER

    onStart() {
        this.char.isSurrender = true
        this.char.isFleeing = true;
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.SURRENDER);
        this.char.updateActionButtons()
        this.char.setIndicatorsVisible(false)
    }

    getPossibleTrollActions(): CharAction[] {
        return [CharAction.RELEASE, CharAction.ROB, CharAction.TAKE_ALL, CharAction.BATTLE_HIT]
    }
}