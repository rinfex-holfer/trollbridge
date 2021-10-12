import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";
import Phaser from "phaser";
import {MUSIC_KEY, SOUND_KEY} from "../core/audio";

export class GameManager {
    isGameover = false
    gameOverReason: string = ''

    constructor(private scene: Phaser.Scene) {
        o_.register.game(this)
    }

    getScene() {
        return this.scene
    }

    gameOver(reason: string) {
        o_.interaction.disableEverything()

        this.isGameover = true
        this.gameOverReason = reason
        eventBus.emit(Evt.GAME_OVER)

        o_.audio.playMusic(MUSIC_KEY.GAMEOVER)
    }
}