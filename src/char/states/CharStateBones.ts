import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {characters} from "../../managers/characters";

export class CharStateBones extends CharState {
    key = CharStateKey.BONES

    collapseTime = 0

    unsub = 0

    collapse() {
        this.collapseTime++
        if (this.collapseTime >= 3) {
            characters.removeChar(this.char.id);
            eventBus.unsubscribe(Evt.TIME_PASSED, this.unsub);
        }
    }

    onStart(): Promise<any> {
        this.unsub = eventBus.on(Evt.TIME_PASSED, () => this.collapse());

        this.char.isBones = true;
        this.char.isAlive = false;
        render.hideAnimation(this.char.id);
        render.changeSpriteVisibility(this.char.id + '_bones', true);
        this.char.actionsMenu.changeActiveButtons([])
        render.setInteractive(this.char.id, false);
        return Promise.resolve();
    }

    onEnd(): Promise<any> {
        eventBus.unsubscribe(Evt.TIME_PASSED, this.unsub);
        return Promise.resolve();
    }
}