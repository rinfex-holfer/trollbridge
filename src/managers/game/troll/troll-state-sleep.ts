import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {gameConstants} from "../../../constants";

export class TrollStateSleep extends TrollState {
    key = TrollStateKey.SLEEP

    onStart() {
        this.host.stop();
        this.host.setAnimation(CharAnimation.IDLE);
        this.host.directToTarget({x: this.host.sprite.x + 1, y: this.host.sprite.y})
        this.host.sprite.obj.rotation = -Math.PI / 2
        this.host.changeTrollHp(gameConstants.HP_FROM_SLEEP)
        this.host.zzz.show(this.host.x - 30, this.host.y - 30)
        o_.time.wait();
    }

    onEnd() {
        this.host.zzz.hide()
        this.host.sprite.obj.rotation = 0
    }
}