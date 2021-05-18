import {render} from "../managers/render";
import {colors} from "../constants";
import {Container, GameText} from "../type-aliases";
import {Char} from "../char/Char";

export class CharMpIndicator {
    isShown = false;

    text: GameText

    constructor(private char: Char) {
        this.text = render.createText(
            '',
            0,
            -50,
            {
                align: 'center',
                fill: colors.WHITE,
                fontSize: 14,
            },
            char.container
        )
        // this.text.anchor.set(0.5, 1);
    }

    update() {
        this.show();
    }

    getText() {
        return `morale: ${this.char.morale} / ${this.char.maxMorale}`
    }

    show() {
        this.text.text = this.getText();
    }

    hide() {
        this.text.text = ''
    }
}