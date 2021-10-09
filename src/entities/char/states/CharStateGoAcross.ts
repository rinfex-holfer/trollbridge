import {CharState} from "./CharState";
import {eventBus, Evt} from "../../../event-bus";
import {CharAnimation, CharStateKey} from "../char-constants";
import {getDistanceBetween} from "../../../utils/utils-math";

export class CharStateGoAcross extends CharState {
    key = CharStateKey.GO_ACROSS

    target = {x: 0, y: this.char.getCoords().y}

    onStart() {
        if (this.char.isDeMounted) {
            this.char.acquireHorse().then(() => {
                this.char.setAnimation(CharAnimation.WALK);
                this.char.moveTowards(this.target.x, this.target.y);
                this.char.directToTarget(this.target)
            })
        } else {
            this.char.setAnimation(CharAnimation.WALK);
            this.char.moveTowards(this.target.x, this.target.y);
            this.char.directToTarget(this.target)
        }
    }

    update(dt: number) {

        const distanceLeft = getDistanceBetween(this.char.container, {x: 0, y: this.char.getCoords().y});

        if (distanceLeft < 10) {
            eventBus.emit(Evt.CHAR_LEFT_BRIDGE, this.char.id);
        }
    }
}