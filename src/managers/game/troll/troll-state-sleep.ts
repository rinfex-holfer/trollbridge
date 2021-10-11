import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {trollConfig} from "../../../configs/troll-config";
import {SOUND_KEY} from "../../core/audio";

export class TrollStateSleep extends TrollState {
    key = TrollStateKey.SLEEP

    onStart() {
        this.host.stop();
        this.host.setAnimation(CharAnimation.IDLE);
        this.host.directToTarget({x: this.host.sprite.x + 1, y: this.host.sprite.y})
        this.host.sprite.obj.rotation = -Math.PI / 2
        this.host.sprite.setOrigin(0.5,0.5)

        const hpToAdd = Math.ceil(
            (o_.lair.bed.upgraded ? trollConfig.HP_FROM_SLEEP_ON_BED : trollConfig.HP_FROM_SLEEP)
            * this.host.maxHp)
        this.host.heal(hpToAdd)

        this.host.changeSelfControl(trollConfig.SELF_CONTROL_FROM_SLEEP)
        this.host.zzz.show(this.host.x - 30, this.host.y - 30)
        o_.time.wait();

        o_.audio.playSound(SOUND_KEY.TROLL_BREATHING_SLOW)
    }

    onEnd() {
        this.host.zzz.hide()
        this.host.setInitialSpriteOrigin()
        this.host.sprite.obj.rotation = 0
    }
}