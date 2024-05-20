import Phaser from "phaser";
import {KeyboardController} from "./keyboard";
import {GAME_INPUT_EVENT, GameInputEventEmitter} from "./types";


export class InputManager extends GameInputEventEmitter {
    keyboard: KeyboardController
    private scene

    constructor(scene: Phaser.Scene) {
        super()
        this.scene = scene
        this.keyboard = new KeyboardController(scene)
        this.keyboard.on(GAME_INPUT_EVENT, (signal) => this.emit(GAME_INPUT_EVENT, signal))
    }
}