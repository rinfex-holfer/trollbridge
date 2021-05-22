import {colors, colorsCSS} from "../constants";
import {Char} from "../char/Char";
import {o_} from "../managers/locator";
import {O_Text} from "../managers/core/render/text";

export class CharHpIndicator {
    isShown = false;

    text: O_Text

    constructor(private char: Char) {
        this.text = o_.render.createText(
            '',
            100,
            -70,
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
        return `HP: ${this.char.hp} / ${this.char.maxHp}`
    }

    show() {
        this.text.setText(this.getText());
    }

    hide() {
        this.text.setText('');
    }
}