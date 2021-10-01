import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";
import Phaser from "phaser";
import {MUSIC_KEY} from "../core/audio";

export class GameManager {
    gameoverCause: string = ''

    constructor(private scene: Phaser.Scene) {
        o_.register.game(this)
    }

    getScene() {
        return this.scene
    }

    gameOver(cause: string) {
        if (!this.gameoverCause) return;

        this.gameoverCause = cause;
        eventBus.emit(Evt.GAME_OVER);

        o_.audio.playMusic(MUSIC_KEY.GAMEOVER)
    }
}