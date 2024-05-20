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

        eventBus.on(Evt.INTERFACE_MENU_OPENED, this.pause)
        eventBus.on(Evt.INTERFACE_MENU_CLOSED, this.resume)
    }

    pause = () => {
        this.scene.scene.pause()
    }

    resume = () => {
        this.scene.scene.resume()
    }

    getScene() {
        return this.scene
    }

    gameOver(reason: string) {
        // o_.interaction.disableEverything()

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