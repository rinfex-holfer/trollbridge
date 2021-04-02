import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";

export class CharStateSurrender extends CharState {
    key = CharStateKey.SURRENDER

    onStart(): Promise<any> {
        this.char.isFleeing = true;
        this.char.setAnimation(CharAnimation.SURRENDER);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.RELEASE,
            CharAction.ROB,
            CharAction.IMPRISON,
            CharAction.KILL,
            CharAction.DEVOUR,
            CharAction.MAKE_FOOD,
        ])
        this.char.actionsMenu.show();
        return Promise.resolve();
    }
}