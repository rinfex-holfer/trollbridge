import {CharState} from "./CharState";
import {render} from "../../managers/render";
import {eventBus, Evt} from "../../event-bus";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../managers/positioner";
import {gameConstants} from "../../constants";
import {trollManager} from "../../managers/troll-manager";

export class CharStateGoToTalk extends CharState {
    key = CharStateKey.GO_TO_TALK

    onStart(): Promise<any> {
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setAnimation(CharAnimation.WALK);
        this.char.actionsMenu.changeActiveButtons([]);
        return Promise.resolve();
    }

    update(dt: number) {

        let speed = this.char.speed

        const distanceLeft = render.moveTowards(
            this.char.id,
            positioner.negotiationX(),
            this.char.getCoords().y,
            dt * speed / 1000,
            true,
            true,
        )
        this.char.syncFlip();

        if (distanceLeft < 10) {
            this.char.readyToTalk()
        }
    }

    onEnd(): Promise<any> {
        render.directToTarget(this.char.id, render.getContainer(trollManager.containerId))
        this.char.syncFlip();
        return Promise.resolve();
    }
}