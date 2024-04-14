import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";
import {O_Container} from "./container";
import Pointer = Phaser.Input.Pointer;

export class O_Sprite {
    obj: Phaser.GameObjects.Sprite

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
    }

    setInteractive(val: boolean, options?: any) {
        if (val) this.obj.setInteractive(options)
        else {
            try {
                this.obj.disableInteractive()
            } catch (e) {
                console.error(e)
            }
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

    onClick(callback: () => void) {
        this.obj.on('pointerdown', (pointer: Pointer) => {
            if (!pointer.rightButtonDown()) callback()
        })
    }

    onRightClick(callback: () => void) {
        this.obj.on('pointerdown', (pointer: Pointer) => {
            if (pointer.rightButtonDown()) callback()
        })
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