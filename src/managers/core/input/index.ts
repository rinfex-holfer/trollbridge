import Phaser from "phaser";
import {KeyboardController} from "./keyboard";
import {GAME_INPUT_EVENT, GameInputEventEmitter} from "./types";
import {o_} from "../../locator";

export class InputManager extends GameInputEventEmitter {
    keyboard: KeyboardController
    private scene

    constructor(scene: Phaser.Scene) {
        super()
        o_.register.input(this)
        this.scene = scene
        this.keyboard = new KeyboardController(scene)
        this.keyboard.on(GAME_INPUT_EVENT, (signal) => this.emit(GAME_INPUT_EVENT, signal))
    }
}