import {TrollState, TrollStateKey} from "./troll-state";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {trollConfig} from "../../../configs/troll-config";
import {SOUND_KEY} from "../../core/audio";
import {eventBusSubscriptions, Evt} from "../../../event-bus";

export class TrollStateSleep extends TrollState {
    key = TrollStateKey.SLEEP

    onStart() {
        o_.lair.bed.occupied = true

        this.host.stop();
        this.host.setAnimation(CharAnimation.IDLE);
        this.host.directToTarget({x: this.host.sprite.x + 1, y: this.host.sprite.y})
        this.host.sprite.obj.rotation = -Math.PI / 2
        this.host.sprite.setOrigin(0.5, 0.5)


        this.host.zzz.show(this.host.x - 30, this.host.y - 30)

        this.subs.on(Evt.TIME_PASSED, (time) => {
            o_.audio.playSound(SOUND_KEY.TROLL_BREATHING_SLOW)

            const hpToAdd = time * Math.ceil(
                (o_.lair.bed.upgraded ? trollConfig.HP_FROM_SLEEP_ON_BED : trollConfig.HP_FROM_SLEEP)
                * this.host.maxHp)
            const selfControllToAdd = trollConfig.SELF_CONTROL_FROM_SLEEP * time

            if (this.host.hunger !== this.host.maxHunger) this.host.heal(hpToAdd)
            this.host.changeSelfControl(selfControllToAdd)
        })
    }

    onEnd() {
        this.host.zzz.hide()
        this.host.setInitialSpriteOrigin()
        this.host.sprite.obj.rotation = 0

        o_.lair.bed.occupied = false
    }
}