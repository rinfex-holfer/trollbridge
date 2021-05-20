import {Container, GameText} from "../../managers/render";
import {colors} from "../../constants";

export interface ButtonOptions {
    text: string
    onClick: () => void
    x?: number
    y?: number
    style?: any
    parent?: Container
}

export class BasicButton {
    private options: ButtonOptions
    text: GameText
    container: Container

    PADDING = 10

    constructor(options: ButtonOptions) {
        this.options = {...options};

        this.container = options.parent || new Container(options.x || 0, options.y || 0)
        this.text = new GameText(options.text, 0, 0, { fontFamily: 'serif', color: colors.BLACK }, {parent: this.container})
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