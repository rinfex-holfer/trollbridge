import {colorsCSS} from "../../constants";
import {O_Container} from "../../managers/core/render/container";
import {O_Text} from "../../managers/core/render/text";
import {o_} from "../../managers/locator";

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

    PADDING = 10

    constructor(options: ButtonOptions) {
        this.options = {...options};

        this.container = o_.render.createContainer(options.x || 0, options.y || 0, options && {parent: options.parent})
        this.text = o_.render.createText(options.text, 0, 0, { fontFamily: 'serif', color: colorsCSS.BLACK }, {parent: this.container})
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
        this.container.setInteractive(true);
        // this.text.alpha = this.oldAlpha
        // this.container.interactive = true;
        // this.container.buttonMode = true;
    }

    disable() {
        this.container.setInteractive(false);
        // this.oldAlpha = this.container.alpha;
        // this.container.alpha = 0.3
        // this.container.interactive = false;
        // this.container.buttonMode = false;
    }

    destroy() {
        this.container.destroy()
    }
}