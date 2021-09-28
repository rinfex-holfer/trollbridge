import {colors, colorsCSS} from "../constants";
import {Char} from "../entities/char/Char";
import {O_Text} from "../managers/core/render/text";
import {o_} from "../managers/locator";

export class CharMpIndicator {
    isShown = false;

    text: O_Text

    constructor(private char: Char) {
        this.text = o_.render.createText(
            '',
            130,
            -50,
            {
                // align: 'center',
                align: 'left',
                color: colorsCSS.WHITE,
                fontSize: '14px',
            },
            {parent: char.container}
        )
        this.text.setOrigin(0, 0);
    }

    update() {
        this.show();
    }

    getText() {
        return `morale: ${this.char.morale} / ${this.char.maxMorale}`
    }

    show() {
        this.text.setText(this.getText());
    }

    hide() {
        this.text.setText('');
    }
}