import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";
import {O_Container} from "./container";

export class O_Sprite {
    obj: Phaser.GameObjects.Sprite

    constructor(private scene: Phaser.Scene, key: keyof typeof resoursePaths.images, x: number, y: number, options?: {width?: number, height?: number, parent?: O_Container}) {
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
        else this.obj.disableInteractive()
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    onClick(callback: () => void) {
        this.obj.on('pointerdown', callback)
    }

    onPointerOver(callback: () => void) {
        this.obj.on('pointerover', callback)
    }

    onPointerOut(callback: () => void) {
        this.obj.on('pointerout', callback)
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() {return this.obj.height }
    get width() {return this.obj.width }
    get alpha() { return this.obj.alpha }
    set alpha(val: number) { this.obj.alpha = val }
    destroy() { this.obj.destroy() }
    addPhysics() { this.scene.physics.add.existing(this.obj) }
    // @ts-ignore
    stop() { this.obj.body.stop() }
    depthToY() { this.obj.depth = this.y }
}