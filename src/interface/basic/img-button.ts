import {BasicButton, ButtonOptions} from "./basic-button";
import {colors, colorsNum} from "../../constants";
import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {resoursePaths} from "../../resourse-paths";

type ImgButtonOptions = ButtonOptions & { img: keyof typeof resoursePaths.images }

export class ImgButton extends BasicButton {
    sprite: O_Sprite

    constructor(options: ImgButtonOptions) {
        if (!options.style) options.style = {};
        super(options);

        this.container.setInteractive(false)
        this.sprite = o_.render.createSprite(options.img, 0, 0, {parent: this.container})
        this.sprite.alpha = 0.75
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.onClick(() => this.onClick())
        this.sprite.onPointerOver(() => {
            this.sprite.alpha = 1
        })
        this.sprite.onPointerOut(() => {
            this.sprite.alpha = 0.75
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
}