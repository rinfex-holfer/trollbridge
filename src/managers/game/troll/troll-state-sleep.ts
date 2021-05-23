import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {gameConstants} from "../../../constants";

export class TrollStateSleep extends TrollState {
    key = TrollStateKey.SLEEP

    onStart() {
        this.host.stop();
        this.host.setAnimation(CharAnimation.IDLE);
        this.host.sprite.obj.rotation = -Math.PI / 2
        this.host.changeTrollHp(gameConstants.HP_FROM_SLEEP)
        o_.time.wait();
    }

    onEnd() {
        this.host.sprite.obj.rotation = 0
        this.host.setAnimation(CharAnimation.IDLE);
    }
}