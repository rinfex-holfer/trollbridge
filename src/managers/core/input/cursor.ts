import {ImageKey} from "../../../utils/utils-types";
import {resoursePaths} from "../../../resourse-paths";
import {o_} from "../../locator";
import {O_Sprite} from "../render/sprite";
import {LayerKey} from "../layers";
import Pointer = Phaser.Input.Pointer;
import {Vec} from "../../../utils/utils-math";

export enum CursorType {
    DEFAULT = 'default',
    POINTER = 'pointer',
    BUILD = 'build',
    ATTACK = 'attack',
    NOT_ALLOWED = 'not_allowed',
    WAIT = 'wait',
    SLEEP = 'sleep',
}

export const CursorImgMap: Record<CursorType, { img: ImageKey, options?: { origin?: Vec } }> = {
    [CursorType.DEFAULT]: {img: "cursor_default"},
    [CursorType.POINTER]: {img: "cursor_default"},
    [CursorType.BUILD]: {img: "cursor_build"},
    [CursorType.ATTACK]: {img: "cursor_attack"},
    [CursorType.NOT_ALLOWED]: {img: "cursor_not_allowed"},
    [CursorType.WAIT]: {img: "cursor_wait", options: {origin: {x: 0.5, y: 0.5}}},
    [CursorType.SLEEP]: {img: "cursor_sleep", options: {origin: {x: 0.5, y: 0.5}}},
} as const


export const getCursorStyle = (type: CursorType) => {
    if (type === CursorType.DEFAULT) {
        return 'default'
    }
    return `url('${resoursePaths.images[CursorImgMap[type].img]}'),pointer`;
}

export class CursorController {
    private isEnabled: boolean = false
    sprite?: O_Sprite

    cursor: CursorType = CursorType.DEFAULT

    constructor() {
        o_.game.getScene().input.on('pointermove', (pointer: Pointer) => {
            this.updateCursorCoord(pointer)
        })
    }

    updateCursorCoord(pointer?: Pointer) {
        if (!this.sprite) return

        if (!pointer) pointer = o_.game.getScene().input.activePointer

        this.sprite.x = pointer.x + o_.camera.camera.scrollX
        this.sprite.y = pointer.y + o_.camera.camera.scrollY
    }

    getCursorConfig() {
        return CursorImgMap[this.cursor]
    }

    getIsEnabled() {
        return this.isEnabled
    }

    createCursorSprite() {
        const pointer = o_.game.getScene().input.activePointer
        const cursorConfig = this.getCursorConfig()

        this.sprite = o_.render.createSprite(cursorConfig.img, pointer.worldX, pointer.worldY)


        let origin = cursorConfig.options?.origin || {x: 0, y: 0}
        this.sprite.setOrigin(origin.x, origin.y)

        o_.layers.add(this.sprite, LayerKey.CURSOR)
    }

    setCursor(cursor: CursorType) {
        this.cursor = cursor

        if (!this.sprite) return

        const cursorConfig = this.getCursorConfig()
        const origin = cursorConfig.options?.origin || {x: 0, y: 0}
        this.sprite.setTexture(cursorConfig.img)
        this.sprite.setOrigin(origin.x, origin.y)
    }

    setDefaultCursor() {
        this.setCursor(CursorType.DEFAULT)
    }

    setEnabled(val: boolean) {
        this.isEnabled = val

        if (this.isEnabled) {
            if (!this.sprite) {
                this.createCursorSprite()
            }
            this.hideNativeCursor()
        }
    }

    hideNativeCursor() {
        o_.game.getScene().input.setDefaultCursor('none')
    }
}