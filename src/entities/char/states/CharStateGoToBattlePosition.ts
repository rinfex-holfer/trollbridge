import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {gameConstants} from "../../../configs/constants";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {o_} from "../../../managers/locator";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import {Char} from "../char";

export class CharStateGoToBattlePosition extends CharState {
    key = CharStateKey.GO_TO_BATTLE_POSITION

    target: Vec

    constructor(host: Char) {
        super(host);

        this.target = host.getBattleCoords()
    }

    onEnd() {
        this.char.onMoveEnd()
    }

    onStart() {
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.WALK);
        this.char.moveTowards(this.target.x, this.target.y);

        const p = createPromiseAndHandlers()
        this.char.movePromise = p.promise
        this.char.onMoveEnd = p.done
        this.char.directToTarget(this.target)
    }

    update(dt: number) {
        const step = (this.char.speed / 1000) * dt
        const distanceLeft = getDistanceBetween(this.char.container, this.target);

        if (distanceLeft <= step) {
            this.char.stop();
            this.char.container.x = this.target.x
            this.char.container.y = this.target.y
            this.char.directToTarget(o_.troll.container)
            this.char.setState(o_.phase.getIsBattle() ? CharStateKey.BATTLE_IDLE : CharStateKey.IDLE)
        }
    }
}