import {BasicButton, ButtonOptions} from "./basic-button";
import {colors, colorsNum} from "../../configs/constants";
import {o_} from "../../managers/locator";

export class SimpleButton extends BasicButton {
    rect: Phaser.GameObjects.Graphics

    constructor(options: ButtonOptions) {
        if (!options.style) options.style = {};
        options.style.fill = colors.BLACK
        super(options);

        const rect = this.getRect();
        this.rect = new Phaser.GameObjects.Graphics(o_.render.scene, {x: 0, y: 0})
        this.rect.lineStyle(2, colorsNum.BLACK, 1);
        this.rect.fillStyle(colorsNum.WHITE)
        this.rect.fillRect(rect.x, rect.y, rect.width, rect.height);

        this.container.obj.add(this.rect);
        this.container.obj.swap(this.rect, this.text.obj)
        this.text.obj.setDepth(2);

        this.rect.alpha = 0.5

        // this.container.swapChildren(this.rect, this.text);

        this.container.onPointerOver(() => {
            this.rect.alpha = 1
        })
        this.container.onPointerOut(() => {
            this.rect.alpha = 0.5
        })
    }
}