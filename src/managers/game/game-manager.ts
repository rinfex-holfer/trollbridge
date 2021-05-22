import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";

export class GameManager {
    gameoverCause: string = ''

    constructor() {
        o_.register.game(this)
    }

    gameOver(cause: string) {
        if (!this.gameoverCause) return;

        this.gameoverCause = cause;
        eventBus.emit(Evt.GAME_OVER);
    }
}