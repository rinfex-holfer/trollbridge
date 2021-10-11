import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {gameConstants} from "../../../configs/constants";
import {o_} from "../../../managers/locator";
import {Char} from "../char";

export class CharStateSurrender extends CharState {
    key = CharStateKey.SURRENDER

    p: { promise: Promise<any>; stop: Function; } | null = null
    goBack: boolean
    showNotification: boolean

    constructor(char: Char, options?: {goBack: boolean, showNotification: boolean}) {
        super(char)

        this.goBack = options?.goBack || false
        this.showNotification = options?.showNotification || false
    }

    onStart() {
        this.char.isSurrender = true
        this.char.isFleeing = true;
        this.char.speed = gameConstants.CHAR_VERY_FAST
        this.char.setIndicatorsVisible(false)

        if (this.showNotification) this.char.statusNotifications.showSurrender()

        this.p = this.char.goToSurrenderPosition()
        this.p.promise.then(() => {
            this.p = null
            this.char.directToTarget(o_.troll)
            this.char.setAnimation(CharAnimation.SURRENDER);
        })

        // if (this.goBack) {
        //
        // } else {
        //     this.char.setAnimation(CharAnimation.SURRENDER);
        // }
    }

    onEnd() {
        if (this.p) this.p.stop()
    }
}