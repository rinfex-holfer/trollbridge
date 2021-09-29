import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {eventBus, Evt} from "../../../event-bus";

export class CharStateDead extends CharState {
    key = CharStateKey.DEAD

    rotTime = 0;

    rot() {
        this.rotTime++
        if (this.rotTime >= 3) {
            this.char.toBones();
        }
    }

    onStart() {
        this.subs.on(Evt.TIME_PASSED, () => this.rot())

        this.char.isAlive = false;
        this.char.setAnimation(CharAnimation.DEAD);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.BATTLE_DEVOUR,
            CharAction.MAKE_FOOD,
        ])
    }
}