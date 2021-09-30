import {colorsCSS} from "../../configs/constants";
import {O_Container} from "../../managers/core/render/container";
import {O_Text} from "../../managers/core/render/text";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";

export interface ButtonOptions {
    text: string
    onClick: () => void
    x?: number
    y?: number
    style?: any
    parent?: O_Container
}

export class BasicButton {
    private options: ButtonOptions
    text: O_Text
    container: O_Container

    disabled = false

    PADDING = 10

    constructor(options: ButtonOptions) {
        this.options = {...options};

        this.container = o_.render.createContainer(options.x || 0, options.y || 0, options && {parent: options.parent})
        this.text = o_.render.createText(options.text, 0, 0, options.style || { fontFamily: 'serif', color: colorsCSS.BLACK }, {parent: this.container})
        this.text.setOrigin(0, 0);

        const rect = this.getRect();
        this.container.setInteractive(
            true,
            {
                cursor: 'pointer',
                hitArea: new Phaser.Geom.Rectangle(rect.x, rect.y, rect.width, rect.height),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains
            }
        )

        this.container.onClick(() => this.onClick())
    }

    getRect() {
        const padding = 10;
        return {
            x: -padding,
            y: -padding,
            width: this.text.obj.width + padding * 2,
            height: this.text.obj.height + padding * 2
        }
    }

    onClick() {
        this.options.onClick();
    }

    move(x: number, y: number) {
        this.container.move(x, y)
    }

    oldAlpha = 1

    enable() {
        if (!this.disabled) return;
        this.disabled = false;

        this.container.setInteractive(true);
        this.container.alpha = this.oldAlpha
    }

    disable() {
        if (this.disabled) return;
        this.disabled = true;

        this.container.setInteractive(false);
        this.oldAlpha = this.container.alpha;
        this.container.alpha = 0.3
    }

    destroy() {
        this.container.destroy()
    }

    setVisible(val: boolean) {
        this.container.setVisibility(val)
    }
}