import {Troll} from "./troll";

export const enum TrollStateKey {
    IDLE = 'IDLE',
    GO_TO_BRIDGE = 'GO_TO_BRIDGE',
    GO_TO_LAIR = 'GO_TO_LAIR',
    // BATTLE_ATTACK = 'BATTLE_ATTACK',
}

export abstract class TrollState {
    abstract key: TrollStateKey
    host: Troll

    constructor(host: Troll) {
        this.host = host
    }

    update(dt: number) {

    }

    onStart() {

    }

    onEnd() {

    }
}