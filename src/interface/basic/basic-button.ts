import {render} from "../../managers/render";
import {Container, GameText} from "../../type-aliases";

export interface ButtonOptions {
    text: string
    onClick: () => void
    parentId?: string
    x?: number
    y?: number
    style?: any
}

let nextId = 0
export class BasicButton {
    private options: ButtonOptions
    text: GameText
    container: Container
    containerId: string

    constructor(options: ButtonOptions) {
        this.options = {...options};

        this.containerId = 'button' + options.text + (nextId++);
        this.container = render.createContainer(this.containerId, options.parentId)
        render.move(this.containerId, options.x || 0, options.y || 0);

        this.text = render.createText(
            options.text,
            0,
            0,
            options.style,
            this.container,
        )
        this.text.interactive = true;
        this.text.buttonMode = true;
        this.text.on('click', options.onClick)
    }

    destroy() {
        this.text.destroy();
        this.container.destroy();
    }

    set x(x: number) {
        this.text.x = x;
    }

    set y(y: number) {
        this.text.y = y;
    }
}