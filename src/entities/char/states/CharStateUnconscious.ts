import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../../interface/char-actions-menu";
import {eventBus, Evt} from "../../../event-bus";
import {o_} from "../../../managers/locator";

export class CharStateUnconscious extends CharState {
    key = CharStateKey.UNCONSCIOUS

    onStart() {
        this.char.setIndicatorsVisible(false)
        this.char.isUnconscious = true

        this.updateActions()
        this.subs.on(Evt.ENCOUNTER_ENDED, () => this.updateActions())

        this.char.runAnimationOnce(CharAnimation.FALL).then(() => this.char.setAnimation(CharAnimation.UNCONSCIOUS))

        if (o_.battle.isBattle) eventBus.emit(Evt.CHAR_DEFEATED, this.char.key)
    }

    updateActions() {
        if (o_.battle.isBattle) {
            this.char.actionsMenu.changeActiveButtons([
                CharAction.BATTLE_DEVOUR,
            ])
        } else {
            this.char.actionsMenu.changeActiveButtons([
                CharAction.MAKE_FOOD,
                CharAction.TAKE_ALL,
                CharAction.ROB,
                CharAction.RELEASE,
            ])
        }
    }
}