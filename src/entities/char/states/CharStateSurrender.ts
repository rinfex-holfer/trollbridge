import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {gameConstants} from "../../../constants";

export class CharStateSurrender extends CharState {
    key = CharStateKey.SURRENDER

    onStart() {
        this.char.isSurrender = true
        this.char.isFleeing = true;
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.SURRENDER);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.RELEASE,
            CharAction.ROB,
            CharAction.TAKE_ALL,
            CharAction.IMPRISON,
            CharAction.KILL,
            CharAction.DEVOUR,
            CharAction.MAKE_FOOD,
        ])
    }
}