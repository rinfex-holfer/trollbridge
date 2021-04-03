import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {charManager} from "../../managers/char-manager";

export class CharStateBones extends CharState {
    key = CharStateKey.BONES

    collapseTime = 0

    unsub = eventBus.on(Evt.TIME_PASSED, () => this.collapse())

    collapse() {
        this.collapseTime++
        if (this.collapseTime >= 3) {
            charManager.removeChar(this.char.id);
        }
    }

    onEnd(): Promise<any> {
        eventBus.unsubscribe(Evt.TIME_PASSED, this.unsub);
        return Promise.resolve();
    }

    onStart(): Promise<any> {
        this.char.isBones = true;
        this.char.isAlive = false;
        render.hideAnimation(this.char.id);
        render.changeSpriteVisibility(this.char.id + '_bones', true);
        this.char.actionsMenu.changeActiveButtons([])
        return Promise.resolve();
    }
}