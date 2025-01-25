import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";
import {O_Container} from "./container";
import {o_} from "../../locator";
import {CursorType, getCursorStyle} from "../input/cursor";
import Pointer = Phaser.Input.Pointer;
import Rectangle = Phaser.Geom.Rectangle;
import Vector2 = Phaser.Math.Vector2;
import {GamePointerEvent} from "../input/types";

export class O_Sprite {
    private bounds = new Rectangle()
    private center = new Vector2()

    obj: Phaser.GameObjects.Sprite
    cursor: CursorType = CursorType.DEFAULT
    isInteractive = false
    isHovered = false

    constructor(private scene: Phaser.Scene, key: keyof typeof resoursePaths.images, x: number, y: number, options?: {
        width?: number,
        height?: number,
        parent?: O_Container
    }) {
        this.obj = new Phaser.GameObjects.Sprite(this.scene, x, y, key);

        if (options?.parent) {
            this.obj = new Phaser.GameObjects.Sprite(this.scene, x, y, key);
            options.parent.add(this);
        } else {
            this.obj = this.scene.add.sprite(x, y, key)
        }

        if (options?.width) this.obj.displayWidth = options.width;
        if (options?.height) this.obj.displayHeight = options.height;

        this.onHover(() => {
            this.isHovered = true
            this.useCursor()
        }, () => {
            this.isHovered = false
            this.stopUsingCursor()
        })
    }

    getBounds() {
        return this.obj.getBounds(this.bounds)
    }

    getCenter(includeParent?: boolean): Vector2 {
        return this.obj.getCenter(this.center, includeParent)
    }

    setLockedToCamera(isLocked: boolean) {
        this.obj.setScrollFactor(isLocked ? 0 : 1)
    }

    setCursor = (cursor: CursorType) => {
        this.cursor = cursor
        if (this.isHovered) this.useCursor()
    }

    useCursor = () => {
        o_.input.cursor.setCursor(this.cursor)
    }
    stopUsingCursor = () => {
        o_.input.cursor.setDefaultCursor()
    }

    setInteractive(val: boolean) {
        // if we call  disableInteractive() on Phaser Sprite that is already non-interactive
        // it throws error
        const needToUpdatePhaserSprite = val !== this.isInteractive

        this.isInteractive = val

        if (val) {
            if (needToUpdatePhaserSprite) this.obj.setInteractive()
            if (this.isHovered) this.useCursor()
        } else {
            if (this.isHovered) this.stopUsingCursor()
            if (needToUpdatePhaserSprite) this.obj.disableInteractive()
        }
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setTexture(key: keyof typeof resoursePaths.images) {
        this.obj.setTexture(key);
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    onClick(callback: (event: GamePointerEvent) => void) {
        this.obj.on('pointerdown', (pointer: Pointer) => {
            if (!pointer.rightButtonDown()) callback({
                x: pointer.worldX,
                y: pointer.worldY
            })
        })
    }

    onRightClick(callback: (event: GamePointerEvent) => void) {
        this.obj.on('pointerdown', (pointer: Pointer) => {
            if (pointer.rightButtonDown()) callback({
                x: pointer.x,
                y: pointer.y
            })
        })
    }

    onHover = (onIn: () => void, onOut: () => void) => {
        this.onPointerOver(onIn)
        this.onPointerOut(onOut)
    }

    onPointerOver(callback: () => void) {
        this.obj.on('pointerover', callback)
    }

    onPointerOut(callback: () => void) {
        this.obj.on('pointerout', callback)
    }

    flipX() {
        this.obj.scaleX = -this.obj.scaleX
    }

    get x() {
        return this.obj.x
    }

    set x(x) {
        this.obj.x = x
    }

    get y() {
        return this.obj.y
    }

    set y(y) {
        this.obj.y = y
    }

    get height() {
        return this.obj.displayHeight
    }

    get width() {
        return this.obj.displayWidth
    }

    setHeight(height: number, preserveProportions = true) {
        this.obj.displayHeight = height
        if (preserveProportions) {
            this.obj.scaleX = Math.sign(this.obj.scaleX) * Math.abs(this.obj.scaleY)
        }
    }

    setWidth(width: number, preserveProportions = true) {
        this.obj.displayWidth = width
        if (preserveProportions) {
            this.obj.scaleY = Math.sign(this.obj.scaleY) * Math.abs(this.obj.scaleX)
        }
    }

    get alpha() {
        return this.obj.alpha
    }

    set alpha(val: number) {
        this.obj.alpha = val
    }

    setVisibility(val: boolean) {
        this.obj.visible = val
    }

    destroy() {
        this.obj.destroy()
    }

    addPhysics() {
        this.scene.physics.add.existing(this.obj)
    }

    stop() {
        throw Error("WTF I am doing here");
        // this.obj.body.stop()
    }

    depthToY() {
        this.obj.depth = this.y
    }
}