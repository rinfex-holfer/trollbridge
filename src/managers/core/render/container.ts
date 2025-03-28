import Phaser from "phaser";
import {O_GameObject} from "./types";
import Pointer = Phaser.Input.Pointer;

export class O_Container {
    obj: Phaser.GameObjects.Container

    constructor(private scene: Phaser.Scene, x: number, y: number, options?: { parent?: O_Container }) {
        this.obj = new Phaser.GameObjects.Container(scene, x, y);
        if (options?.parent) {
            options.parent.add(this)
        } else {
            scene.add.existing(this.obj);
        }
    }

    setLockedToCamera(isLocked: boolean) {
        this.obj.setScrollFactor(isLocked ? 0 : 1)
    }

    setInteractive(val: boolean, options?: any, options2?: any) {
        if (val) this.obj.setInteractive(options, options2)
        else this.obj.disableInteractive()
    }

    add(obj: O_GameObject) {
        this.obj.add(obj.obj)
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

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    getCoords() {
        return {x: this.obj.x, y: this.obj.y}
    }

    remove(child: O_GameObject) {
        this.obj.remove(child.obj)
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
        return this.obj.height
    }

    get width() {
        return this.obj.width
    }

    get alpha() {
        return this.obj.alpha
    }

    set alpha(val: number) {
        this.obj.alpha = val
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    destroy() {
        this.obj.destroy()
    }

    addPhysics() {
        this.scene.physics.add.existing(this.obj)
    }

    // @ts-ignore
    stop() {
        this.obj.body.stop()
    }

    depthToY() {
        this.obj.depth = this.y
    }
}