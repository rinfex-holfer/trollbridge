import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {gameConstants} from "../../../configs/constants";
import {Evt} from "../../../event-bus";
import {flyingStatusChange} from "../../../interface/basic/flying-status-change";

export class CharStateBattleSurrender extends CharState {
    key = CharStateKey.BATTLE_SURRENDER

    onStart() {
        this.char.isSurrender = true
        this.char.isFleeing = true;
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.SURRENDER);
        this.subs.on(Evt.ENCOUNTER_ENDED, () => this.char.surrender())
    }

    // getPossibleTrollActions(): CharAction[] {
    //     return [CharAction.BATTLE_HIT, CharAction.BATTLE_THROW_ROCK, CharAction.BATTLE_DEVOUR]
    // }
}