import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {TrollLocation} from "../../../types";
import {CharAnimation} from "../../../entities/char/char-constants";
import {eventBus, Evt} from "../../../event-bus";
import {o_} from "../../locator";
import {TrollIntention} from "./types";
import {onTrollCameToBridge, onTrollCameToLair, onTrollSleep} from "../../../helpers";
import {positioner} from "../positioner";

export class TrollStateGoTo extends TrollState {
    key = TrollStateKey.GO_TO

    target: Vec
    intention: TrollIntention

    constructor(host: Troll, options: {intention: TrollIntention}) {
        super(host);
        this.intention = options.intention
        this.target = this.getTarget()
    }

    getTarget() {
        const target = {
            x: 0,
            y: 0,
        }
        switch (this.intention) {
            case TrollIntention.LAIR:
                const lairPos = positioner.getLairPosition();
                target.x = lairPos.x + lairPos.width / 2
                target.y = lairPos.y + lairPos.height / 2
                break;
            case TrollIntention.BRIDGE:
                const bridgePos = positioner.bridgePosition();
                target.x = bridgePos.x + bridgePos.width / 2
                target.y = bridgePos.y + bridgePos.height / 2
                break;
            case TrollIntention.BED:
                const bedPos = positioner.getBedPosition();
                target.x = bedPos.x
                target.y = bedPos.y
                break;

        }
        return target;
    }

    onStart() {
        this.host.setAnimation(CharAnimation.WALK)
        this.host.moveTowards(this.target.x, this.target.y)

        switch (this.intention) {
            case TrollIntention.LAIR:
                onTrollCameToLair()
                break;
            case TrollIntention.BRIDGE:
                onTrollCameToBridge()
                break;
            case TrollIntention.BED:
                onTrollSleep()
                break;
        }

        this.checkDistance()
    }

    onEnd() {
        switch (this.intention) {
            case TrollIntention.LAIR:
                onTrollCameToLair()
                break;
            case TrollIntention.BRIDGE:
                onTrollCameToBridge()
                break;
            case TrollIntention.BED:
                onTrollSleep()
                break;
        }
    }

    checkDistance() {
        const distanceLeft = getDistanceBetween(this.host.sprite, this.target);

        if (distanceLeft < 10) {
            switch (this.intention) {
                case TrollIntention.LAIR:
                    this.host.goIdle()
                    break;
                case TrollIntention.BRIDGE:
                    this.host.goIdle()
                    break;
                case TrollIntention.BED:
                    this.host.goSleep()
                    break;
            }
        }
    }

    update(dt: number) {
        this.checkDistance()
    }
}