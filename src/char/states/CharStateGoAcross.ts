import {CharState} from "./CharState";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateGoAcross extends CharState {
    key = CharStateKey.GO_ACROSS

    onStart() {
        this.char.setAnimation(CharAnimation.WALK);
        this.char.actionsMenu.changeActiveButtons([]);
    }

    update(dt: number) {

        const distanceLeft = render.moveTowards(
            this.char.id,
            0,
            this.char.getCoords().y,
            dt * this.char.speed / 1000,
            true,
            true,
        )
        this.char.syncFlip();

        if (distanceLeft < 10) {
            eventBus.emit(Evt.CHAR_LEFT_BRIDGE, this.char.id);
        }
    }
}