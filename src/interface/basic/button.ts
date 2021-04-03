import {render} from "../../managers/render";
import {Container, GameText} from "../../type-aliases";

interface ButtonOptions {
    text: string
    onClick: () => void
    parent?: Container
    x?: number
    y?: number
}

export class Button {
    private options: ButtonOptions
    text: GameText

    constructor(options: ButtonOptions) {
        this.options = {...options};
        this.text = render.createText(
            options.text,
            options.x || 0,
            options.y || 0,
            options.parent
        )
        this.text.interactive = true;
        this.text.buttonMode = true;
        this.text.on('click', options.onClick)
    }

    destroy() {
        this.text.destroy();
    }
}