import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";

export class CharStateFightingIdle extends CharState {
    key = CharStateKey.FIGHTING_IDLE

    onStart(): Promise<any> {
        this.char.setAnimation(CharAnimation.IDLE);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.BATTLE_HIT
        ])
        return Promise.resolve();
    }

    update(dt: number) {
        if (this.char.hp <= 0) {
            this.char.surrender();
        }
    }
}