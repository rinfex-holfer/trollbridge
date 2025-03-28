import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {eventBus, Evt} from "../../../event-bus";
import {o_} from "../../../managers/locator";
import {Char} from "../char";
import {TrollLocation} from "../../../types";
import {charTexts} from "../../../char-texts";

type StateOptions = { duration: number, withAnimation?: boolean }

export class CharStateUnconscious extends CharState {
    key = CharStateKey.UNCONSCIOUS

    options: StateOptions
    turnsLeft: number

    constructor(char: Char, options: StateOptions) {
        super(char);

        this.options = options
        this.turnsLeft = this.options.duration
    }

    onStart() {
        if (this.char.hp === 0) this.char.setIndicatorsVisible(false)
        this.char.isUnconscious = true

        this.subs.on(Evt.BATTLE_TRAVELLERS_TURN_END, () => this.onTurn())
        this.subs.on(Evt.TROLL_LOCATION_CHANGED, (loc) => {
            if (loc !== TrollLocation.BRIDGE) this.onTrollLeft()
        })

        if (this.options.withAnimation) {
            this.char.runAnimationOnce(CharAnimation.FALL)
                .then(() => this.char.setAnimation(CharAnimation.UNCONSCIOUS))
        } else {
            this.char.setAnimation(CharAnimation.UNCONSCIOUS)
        }


        if (o_.phase.getIsBattle() && this.char.hp === 0) eventBus.emit(Evt.CHAR_DEFEATED, this.char.key)
    }

    onEnd() {
        this.char.isUnconscious = false
    }

    onTurn() {
        this.turnsLeft--

        if (this.turnsLeft <= 0) {
            this.wakeUp()
        }
    }

    onTrollLeft() {
        this.char.say(charTexts.runHeDoesNotSee)

        this.char.setState(CharStateKey.GO_ACROSS)
    }

    wakeUp() {
        if (o_.phase.getIsBattle()) this.char.goToBattlePosition()
        else this.char.setState(CharStateKey.IDLE)
    }
}