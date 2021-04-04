import {render} from "../../managers/render";
import {Container, GameGraphics, GameText} from "../../type-aliases";
import {BasicButton, ButtonOptions} from "./basic-button";
import {colors, colorsNum} from "../../constants";

const PADDING = 10;

export class SimpleButton extends BasicButton {
    rect: GameGraphics

    constructor(options: ButtonOptions) {
        if (!options.style) options.style = {};
        options.style.fill = colors.BLACK
        super(options);

        this.rect = render.createRectangle({
            parent: this.container,
            x: -PADDING,
            y: -PADDING,
            height: this.text.height + PADDING * 2,
            width: this.text.width + PADDING * 2,
            // lineColor: colorsNum.GREEN,
            // lineWidth: 2,
            fill: colorsNum.WHITE,
        })

        this.rect.alpha = 0.5

        this.container.swapChildren(this.rect, this.text);

        this.container.interactive = true;
        this.container.buttonMode = true;
        this.container.on('mouseover', () => {
            this.rect.alpha = 1
        })
        this.container.on('mouseout', () => {
            this.rect.alpha = 0.5
        })
    }
}