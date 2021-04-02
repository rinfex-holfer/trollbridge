import {CharState, CharStateKey} from "./CharState";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";

export class CharStateGoAcross extends CharState {
    key = CharStateKey.GO_ACROSS

    onStart(): Promise<any> {
        this.char.setMoveAnimation();
        return Promise.resolve();
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

        if (distanceLeft < 10) {
            eventBus.emit(Evt.CHAR_LEFT_BRIDGE, this.char.id);
        }
    }
}