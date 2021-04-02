import {Char} from "../Char";

export const enum CharStateKey {
    IDLE = 'IDLE',
    GO_ACROSS = 'GO_ACROSS'
}

export abstract class CharState {
    abstract key: CharStateKey
    char: Char

    constructor(char: Char) {
        this.char = char
    }

    update(dt: number) {

    }

    onStart(): Promise<any> {
        return Promise.resolve();
    }

    onEnd(): Promise<any> {
        return Promise.resolve();
    }
}