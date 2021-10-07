import {BasicButton, ButtonOptions} from "./basic-button";
import {colors, colorsNum} from "../../configs/constants";
import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {resoursePaths} from "../../resourse-paths";

type ImgButtonOptions = ButtonOptions & { img: keyof typeof resoursePaths.images, width?: number, height?: number }

export class ImgButton extends BasicButton {
    sprite: O_Sprite

    visiblyDisabled: boolean

    constructor(options: ImgButtonOptions) {
        if (!options.style) options.style = {};
        super(options);

        this.visiblyDisabled = false

        this.container.setInteractive(false)
        this.sprite = o_.render.createSprite(options.img, 0, 0, {parent: this.container})
        this.sprite.alpha = 0.75
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.onClick(() => this.onClick())
        if (options.width) this.sprite.setWidth(options.width)
        if (options.height) this.sprite.setHeight(options.height)
        this.sprite.onPointerOver(() => {
            if (!this.visiblyDisabled) this.sprite.alpha = 1
        })
        this.sprite.onPointerOut(() => {
            if (!this.visiblyDisabled) this.sprite.alpha = 0.75
        })

        this.text.y = this.text.y - 30
        this.text.setOrigin(0.5, 1)
    }

    enable() {
        if (!this.disabled) return;
        this.disabled = false;

        this.sprite.setInteractive(true);
        this.sprite.alpha = this.oldAlpha
    }

    disable() {
        if (this.disabled) return;
        this.disabled = true;

        this.sprite.setInteractive(false);
        this.oldAlpha = this.sprite.alpha;
        this.sprite.alpha = 0.3
    }

    visiblyDisable() {
        this.visiblyDisabled = true
        this.oldAlpha = this.sprite.alpha;
        this.sprite.alpha = 0.3
    }

    visiblyEnable() {
        this.visiblyDisabled = false
        this.oldAlpha = this.sprite.alpha;
        this.sprite.alpha = this.oldAlpha
    }
}