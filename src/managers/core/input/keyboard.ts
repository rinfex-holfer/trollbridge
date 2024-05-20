import {GameInputEvent} from "./domain";
import {GAME_INPUT_EVENT, GameInputEventEmitter} from "./types";

type KeycodeToSignal = Partial<Record<string, GameInputEvent>>

const defaultConfig: KeycodeToSignal = {
    "KeyW": GameInputEvent.UP,
    "KeyD": GameInputEvent.RIGHT,
    "KeyS": GameInputEvent.DOWN,
    "KeyA": GameInputEvent.LEFT,

    "ArrowUp": GameInputEvent.UP,
    "ArrowRight": GameInputEvent.RIGHT,
    "ArrowDown": GameInputEvent.DOWN,
    "ArrowLeft": GameInputEvent.LEFT,

    "Enter": GameInputEvent.ENTER,
    "Space": GameInputEvent.ENTER,
    "Escape": GameInputEvent.CANCEL,
}

export class KeyboardController extends GameInputEventEmitter {
    private config: KeycodeToSignal = {}
    private scene: Phaser.Scene

    constructor(
        scene: Phaser.Scene,
        config: KeycodeToSignal = defaultConfig
    ) {
        super()
        this.scene = scene
        this.config = config
        this.setupListener()
    }

    private setupListener = () => {
        if (!this.scene.input.keyboard) {
            return
        }

        // phaser input.keyboard.on('keydown') method breaks when game is paused:
        // this.scene.input.keyboard.on('keydown', this.onKeyboardEvent);
        // so using native API:
        window.document.addEventListener('keydown', this.onKeyboardEvent)
    }

    private onKeyboardEvent = (event: KeyboardEvent) => {
        const signal = this.config[event.code]
        if (signal) {
            this.emit(GAME_INPUT_EVENT, signal)
        }
    }
}
