import Phaser from "phaser";
import {O_Container} from "./container";
import {Vec} from "../../../utils/utils-math";
import {TextKey} from "../../../translations";
import i18next from "i18next";
import {eventBus, Evt} from "../../../event-bus";
import {sub} from "../../../utils/utils-events";
import {o_} from "../../locator";

export class O_Text {
    obj: Phaser.GameObjects.Text

    textKey: TextKey
    textVars: any

    unsub: () => void

    constructor(private scene: Phaser.Scene, params: {
        textKey: TextKey,
        textVars?: any
        x: number,
        y: number,
        style: Phaser.Types.GameObjects.Text.TextStyle,
        parent?: O_Container
    }) {
        this.textKey = params.textKey
        this.textVars = params.textVars
        this.obj = new Phaser.GameObjects.Text(this.scene, params.x, params.y, i18next.t(params.textKey, params.textVars) as string, params.style);

        if (params?.parent) {
            params.parent.add(this)
        }

        this.unsub = sub(Evt.LANGUAGE_CHANGED, this.updateObj)
    }

    updateObj = () => {
        // hack to prevent bug with onPointerOut callback that calls deleted text
        // @ts-ignore
        if (this.obj.frame.data) {
            this.obj.text = o_.texts.t(this.textKey, this.textVars)
        }
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setText(textKey: TextKey, textVars?: any) {
        this.textKey = textKey
        if (textVars) {
            this.textVars = textVars
        }

        this.updateObj()
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
        this.obj.visible = val
    }

    destroy() {
        this.unsub()
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

    getBounds() {
        return this.obj.getBounds()
    }

    getLeftCenter(): Vec {
        return this.obj.getLeftCenter()
    }

    getRightCenter(): Vec {
        return this.obj.getRightCenter()
    }

    getBottomCenter(): Vec {
        return this.obj.getBottomCenter()
    }
}