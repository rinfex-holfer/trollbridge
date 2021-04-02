import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";

export class CharStateDead extends CharState {
    key = CharStateKey.DEAD

    onStart(): Promise<any> {
        this.char.isAlive = false;
        this.char.setAnimation(CharAnimation.DEAD);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.TAKE_ALL,
            CharAction.DEVOUR,
            CharAction.MAKE_FOOD,
        ])
        this.char.actionsMenu.show();
        return Promise.resolve();
    }
}