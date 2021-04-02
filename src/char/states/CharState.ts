import {Char} from "../Char";
import {CharStateKey} from "../char-constants";

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