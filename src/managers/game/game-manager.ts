import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";
import Phaser from "phaser";
import {MUSIC_KEY} from "../core/audio";
import {pause} from "../../utils/utils-async";

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

        pause(1500).then(() => eventBus.emit(Evt.GAME_OVER))
    }

    gameWin(reason: string) {
        this.isGameover = true
        pause(1500).then(() => {
            o_.audio.playMusic(MUSIC_KEY.MARCH)
            eventBus.emit(Evt.GAME_WIN, reason)
        })
    }
}