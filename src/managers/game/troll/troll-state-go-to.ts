import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {CharAnimation} from "../../../entities/char/char-constants";
import {TrollIntention} from "./types";
import {onTrollCameToBridge, onTrollCameToLair, onTrollSleep} from "../../../helpers";
import {positioner} from "../positioner";
import {o_} from "../../locator";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export class TrollStateGoTo extends TrollState {
    key = TrollStateKey.GO_TO

    target: Vec
    intention: TrollIntention
    minDistance: number = 10

    constructor(host: Troll, options: {intention: TrollIntention}) {
        super(host);
        this.intention = options.intention
        this.target = this.getTarget()
        this.minDistance = options.intention === TrollIntention.CHAR ? 50 : 10

        const {promise, done} = createPromiseAndHandlers()

        this.host.onMoveFinished = done
        this.host.movePromise = promise
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
            case TrollIntention.CHAR:
                const char = o_.characters.getTravellers().find(t => t.id === o_.troll.charToApproach)
                if (!char) throw Error('WTF')
                target.x = char.container.x
                target.y = char.container.y
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
            case TrollIntention.CHAR:
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
        this.host.onMoveFinished()
    }

    checkDistance() {
        const distanceLeft = getDistanceBetween(this.host.sprite, this.target);

        if (distanceLeft <= this.minDistance) {
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
                case TrollIntention.CHAR:
                    this.host.goIdle()
                    break;
            }
        }
    }

    update(dt: number) {
        this.checkDistance()
    }
}