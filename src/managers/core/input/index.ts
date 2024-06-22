import Phaser from "phaser";
import {KeyboardController} from "./keyboard";
import {GAME_INPUT_EVENT, GameInputEventEmitter} from "./types";
import {o_} from "../../locator";
import {CursorController, CursorType, getCursorStyle} from "./cursor";

export class InputManager extends GameInputEventEmitter {
    keyboard: KeyboardController
    cursor: CursorController
    private scene

    constructor(scene: Phaser.Scene) {
        super()
        o_.register.input(this)
        this.scene = scene
        this.keyboard = new KeyboardController(scene)
        this.keyboard.on(GAME_INPUT_EVENT, (signal) => this.emit(GAME_INPUT_EVENT, signal))

        this.cursor = new CursorController()

        this.setDefaultCursor()
    }

    initializeCursor() {
        this.cursor.setEnabled(true)
    }

    setDefaultCursor() {
        // console.log("updateDefaultCursor")
        this.setCursor(CursorType.DEFAULT)
    }

    setCursor(cursorType: CursorType) {
        // this.scene.input.setDefaultCursor(getCursorStyle(cursorType))
    }

    getCursor(cursorType: CursorType) {
        return getCursorStyle(cursorType)
    }
}