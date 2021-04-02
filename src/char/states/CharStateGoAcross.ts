import {CharState} from "./CharState";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {CharAnimation, CharStateKey} from "../char-constants";

export class CharStateGoAcross extends CharState {
    key = CharStateKey.GO_ACROSS

    onStart(): Promise<any> {
        this.char.setAnimation(CharAnimation.WALK);
        return Promise.resolve();
    }

    update(dt: number) {

        let speed = this.char.speed
        if (this.char.isFleeing) speed *= 2

        const distanceLeft = render.moveTowards(
            this.char.id,
            0,
            this.char.getCoords().y,
            dt * speed / 1000,
            true,
            true,
        )

        if (distanceLeft < 10) {
            eventBus.emit(Evt.CHAR_LEFT_BRIDGE, this.char.id);
        }
    }
}