import {CharState} from "./CharState";
import {render} from "../../managers/render";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../managers/positioner";
import {gameConstants} from "../../constants";
import {getDistanceBetween} from "../../utils/utils-math";
import {getTroll} from "../../managers/troll";

export class CharStateGoToTalk extends CharState {
    key = CharStateKey.GO_TO_TALK

    target = {x: positioner.negotiationX(), y: this.char.getCoords().y}

    onStart() {
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.WALK);
        this.char.actionsMenu.changeActiveButtons([]);
        this.char.moveTowards(this.target.x, this.target.y);
    }

    update(dt: number) {

        let speed = this.char.speed

        const distanceLeft = getDistanceBetween(this.char.container, this.target);

        if (distanceLeft < 10) {
            this.char.readyToTalk()
        }
    }

    onEnd() {
        render.directToTarget(this.char.container, getTroll().sprite)
    }
}