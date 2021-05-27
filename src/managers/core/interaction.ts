import Phaser from "phaser";
import {createMessageEmitter} from "../../utils/utils-misc";
import {o_} from "../locator";

export type ClickHandler = (pointer: Phaser.Input.Pointer) => void

export class InteractionManager {
    constructor(private scene: Phaser.Scene) {
        o_.register.interaction(this)
        window.addEventListener('contextmenu', e => e. preventDefault())
        scene.input.on('pointerdown', this.onClick)
    }

    private rightClickEmitter = createMessageEmitter<Phaser.Input.Pointer>()
    private leftClickEmitter = createMessageEmitter<Phaser.Input.Pointer>()

    private onClick = (pointer: Phaser.Input.Pointer) => {
        if (pointer.rightButtonDown()) {
            this.rightClickEmitter.emit(pointer)
        } else {
            this.leftClickEmitter.emit(pointer)
        }
    }

    onRightClick(handler: ClickHandler) {
        const id = this.rightClickEmitter.sub(handler)
        return (() => this.rightClickEmitter.unsub(id)) as () => void
    }

    onLeftClick(handler: ClickHandler) {
        const id = this.leftClickEmitter.sub(handler)
        return (() => this.rightClickEmitter.unsub(id)) as () => void
    }
}