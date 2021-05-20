import {GameText, render} from "../managers/render";
import {colors} from "../constants";
import {Char} from "../char/Char";

export class CharHpIndicator {
    isShown = false;

    text: GameText

    constructor(private char: Char) {
        this.text = new GameText(
            '',
            0,
            -70,
            {
                align: 'center',
                color: colors.WHITE,
                fontSize: '14px',
            },
            {parent: char.container}
        )
        // this.text.anchor.set(0.5, 1);
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