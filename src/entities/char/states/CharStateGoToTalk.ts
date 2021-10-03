import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../../managers/game/positioner";
import {gameConstants} from "../../../configs/constants";
import {getDistanceBetween} from "../../../utils/utils-math";
import {o_} from "../../../managers/locator";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export class CharStateGoToTalk extends CharState {
    key = CharStateKey.GO_TO_TALK

    target = this.char.getBattleCoords()

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
    }

    update(dt: number) {
        const step = (this.char.speed / 1000) * dt
        const distanceLeft = getDistanceBetween(this.char.container, this.target);

        if (distanceLeft <= step) {
            this.char.stop();
            this.char.container.x = this.target.x
            this.char.container.y = this.target.y
            this.char.directToTarget(o_.troll.sprite)
            this.char.readyToTalk()
        }
    }
}