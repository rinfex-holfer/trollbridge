import {Char} from "../Char";
import {CharStateKey} from "../char-constants";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import {subscriptions} from "../../../event-bus";
import {CharAction} from "../../../interface/char-actions-menu";

export abstract class CharState {
    abstract key: CharStateKey
    char: Char

    onEndPromise: Promise<any>
    onEndCallback: () => void

    subs = subscriptions()

    constructor(char: Char) {
        this.char = char

        const {promise, done} = createPromiseAndHandlers()
        this.onEndPromise = promise
        this.onEndCallback = done
    }

    start() {
        this.onStart()
        this.char.updateActionButtons()
        return this.onEndPromise
    }
    protected onStart() {}

    end() {
        this.subs.clear()
        this.onEnd()
        this.onEndCallback()
    }
    protected onEnd() {}

    update(dt: number) {

    }

    getPossibleTrollActions(): CharAction[] {
        return []
    }
}