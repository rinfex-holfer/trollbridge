import Phaser from "phaser";
import {getGameSize} from "../../utils/utils-misc";
import {o_} from "../locator";
import {TrollLocation} from "../../types";
import {LayerKey} from "./layers";
import {O_Sprite} from "./render/sprite";
import {createMessageEmitter} from "../../utils/utils-events";

export type ClickHandler = (pointer: Phaser.Input.Pointer) => void

export class InteractionManager {
    layerUnderButtons: O_Sprite

    constructor(private scene: Phaser.Scene) {
        o_.register.interaction(this)
        window.addEventListener('contextmenu', e => e.preventDefault())
        scene.input.on('pointerdown', this.onClick)

        // create layer to close buttons
        const size = getGameSize()
        this.layerUnderButtons = o_.render.createSprite('empty_sprite', 0, 0, size)
        this.layerUnderButtons.setOrigin(0, 0)
        this.layerUnderButtons.setInteractive(false)
        o_.layers.add(this.layerUnderButtons, LayerKey.UNDER_BUTTONS)
        this.layerUnderButtons.setVisibility(false)
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

    setLayerUnderButtonsActive(cb: () => void) {
        this.layerUnderButtons.setVisibility(true)
        this.layerUnderButtons.setInteractive(true)
        this.layerUnderButtons.onClick(() => {
            cb()
        })
    }

    setLayerUnderButtonsUnactive() {
        this.layerUnderButtons.setInteractive(false)
        this.layerUnderButtons.setVisibility(false)
    }

    onRightClick(handler: ClickHandler) {
        const id = this.rightClickEmitter.sub(handler)
        return (() => this.rightClickEmitter.unsub(id)) as () => void
    }

    onLeftClick(handler: ClickHandler) {
        const id = this.leftClickEmitter.sub(handler)
        return (() => this.leftClickEmitter.unsub(id)) as () => void
    }

    disableEntities() {
        o_.entities.getAll().forEach(o => o.setInteractive(false))
    }
}