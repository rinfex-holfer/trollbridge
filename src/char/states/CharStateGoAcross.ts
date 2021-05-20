import {CharState} from "./CharState";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {CharAnimation, CharStateKey} from "../char-constants";
import {getDistanceBetween} from "../../utils/utils-math";

export class CharStateGoAcross extends CharState {
    key = CharStateKey.GO_ACROSS

    onStart() {
        this.char.setAnimation(CharAnimation.WALK);
        this.char.actionsMenu.changeActiveButtons([]);
        this.char.moveTowards(0, this.char.getCoords().y);
    }

    update(dt: number) {

        const distanceLeft = getDistanceBetween(this.char.container, {x: 0, y: this.char.getCoords().y});

        if (distanceLeft < 10) {
            eventBus.emit(Evt.CHAR_LEFT_BRIDGE, this.char.id);
        }
    }
}