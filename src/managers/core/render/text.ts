import Phaser from "phaser";
import {O_Container} from "./container";

export class O_Text {
    obj: Phaser.GameObjects.Text

    constructor(private scene: Phaser.Scene, text: string, x: number, y: number, style: Phaser.Types.GameObjects.Text.TextStyle, options?: {parent?: O_Container}) {
        this.obj = new Phaser.GameObjects.Text(this.scene, x, y, text, style);

        if (options?.parent) {
            options.parent.add(this)
        }

    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setText(str: string) {
        // hack to prevent bug with onPointerOut callback that calls deleted text
        // @ts-ignore
        if (this.obj.frame.data) {
            this.obj.text = str;
        }
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() { return this.obj.height }
    get width() { return this.obj.width }
    get alpha() { return this.obj.alpha }
    set alpha(val: number) { this.obj.alpha = val }
    setVisibility(val: boolean) { this.obj.visible = val }
    destroy() { this.obj.destroy() }
    addPhysics() { this.scene.physics.add.existing(this.obj) }
    // @ts-ignore
    stop() { this.obj.body.stop() }
    depthToY() { this.obj.depth = this.y }
}