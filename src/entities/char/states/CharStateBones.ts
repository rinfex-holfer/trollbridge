import {CharState} from "./CharState";
import {CharStateKey} from "../char-constants";
import {eventBus, Evt} from "../../../event-bus";
import {o_} from "../../../managers/locator";

export class CharStateBones extends CharState {
    key = CharStateKey.BONES

    collapseTime = 0

    unsub = -1

    collapse() {
        this.collapseTime++
        if (this.collapseTime >= 3) {
            o_.characters.removeChar(this.char.id);
            eventBus.unsubscribe(Evt.TIME_PASSED, this.unsub);
        }
    }

    onStart() {
        this.unsub = eventBus.on(Evt.TIME_PASSED, () => this.collapse());

        this.char.isBones = true;
        this.char.isAlive = false;
        this.char.sprite.setVisibility(false);
        this.char.bones.setVisibility(true);
        this.char.disableInteractivity()
    }

    onEnd() {
        eventBus.unsubscribe(Evt.TIME_PASSED, this.unsub);
    }
}