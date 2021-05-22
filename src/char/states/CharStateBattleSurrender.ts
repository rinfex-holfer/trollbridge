import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";
import {gameConstants} from "../../constants";
import {eventBus, Evt} from "../../event-bus";

export class CharStateBattleSurrender extends CharState {
    key = CharStateKey.BATTLE_SURRENDER

    unsub: any

    onStart() {
        this.char.isSurrender = true
        this.char.isFleeing = true;
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.SURRENDER);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.BATTLE_DEVOUR,
        ])
        this.unsub = eventBus.once(Evt.ENCOUNTER_ENDED, () => this.char.surrender())
    }

    onEnd() {
        eventBus.unsubscribe(Evt.ENCOUNTER_ENDED, this.unsub);
    }
}