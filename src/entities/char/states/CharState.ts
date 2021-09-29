import {Char} from "../Char";
import {CharStateKey} from "../char-constants";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export abstract class CharState {
    abstract key: CharStateKey
    char: Char

    onEndPromise: Promise<any>
    onEndCallback: () => void

    constructor(char: Char) {
        this.char = char

        const {promise, done} = createPromiseAndHandlers()
        this.onEndPromise = promise
        this.onEndCallback = done
    }

    start() {
        this.onStart()
        return this.onEndPromise
    }
    onStart() {}

    end() {
        this.onEnd()
        this.onEndCallback()
    }
    onEnd() {}

    update(dt: number) {

    }
}