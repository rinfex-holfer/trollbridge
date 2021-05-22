import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {positioner} from "../positioner";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {TrollLocation} from "../../../types";
import {CharAnimation} from "../../../char/char-constants";
import {eventBus, Evt} from "../../../event-bus";
import {o_} from "../../locator";

export class TrollStateGoToLair extends TrollState {
    key = TrollStateKey.GO_TO_LAIR

    target: Vec

    constructor(host: Troll) {
        super(host);

        const bridgePos = positioner.getLairPosition();
        this.target = {
            x: bridgePos.x + bridgePos.width / 2,
            y: bridgePos.y + bridgePos.height / 2
        }
    }

    onStart() {
        this.host.setAnimation(CharAnimation.WALK);
        this.host.moveTowards(this.target.x, this.target.y);

        o_.lair.disableInterface(true);
        o_.bridge.disableInterface();
    }

    onEnd() {
        o_.lair.waitButton.enable();
        o_.bridge.enableInterface();
    }

    update(dt: number) {

        const distanceLeft = getDistanceBetween(this.host.sprite, this.target);

        if (distanceLeft < 10) {
            this.host.location = TrollLocation.LAIR;
            this.host.directToTarget({x: 99999, y: 0})
            this.host.goIdle();
            eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);
        }
    }
}