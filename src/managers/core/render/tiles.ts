import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";

export class Tiles {
    obj: Phaser.GameObjects.TileSprite

    constructor(private scene: Phaser.Scene, key: keyof typeof resoursePaths.images, x: number, y: number, width: number, height: number) {
        this.obj = this.scene.add.tileSprite(x, y, width, height, key);
    }

    setInteractive(val: boolean, options?: any) {
        if (val) this.obj.setInteractive(options)
        else this.obj.disableInteractive()
    }

    onClick(callback: () => void) {
        this.obj.on('pointerdown', callback)
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() { return this.obj.height }
    get width() { return this.obj.width }
    destroy() { this.obj.destroy() }
    addPhysics() { this.scene.physics.add.existing(this.obj) }
    // @ts-ignore
    stop() { this.obj.body.stop() }
    depthToY() { this.obj.depth = this.y }
}