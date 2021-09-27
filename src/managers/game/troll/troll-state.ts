import {Troll} from "./troll";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export const enum TrollStateKey {
    IDLE = 'IDLE',
    GO_TO = 'GO_TO',
    SLEEP = 'SLEEP',
    BATTLE_ATTACK = 'BATTLE_ATTACK',
}

export abstract class TrollState {
    abstract key: TrollStateKey
    host: Troll

    onEndPromise: Promise<any>
    onEndCallback: () => void

    constructor(host: Troll) {
        this.host = host

        const {promise, done} = createPromiseAndHandlers()
        this.onEndPromise = promise
        this.onEndCallback = done
    }

    update(dt: number) {

    }

    start() {
        this.onStart()
        return this.onEndPromise
    }

    onStart() {

    }

    end() {
        this.onEnd()
        this.onEndCallback()
    }

    onEnd() {

    }
}