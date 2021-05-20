import {GameText, render} from "../managers/render";
import {colors} from "../constants";
import {Char} from "../char/Char";

export class CharMpIndicator {
    isShown = false;

    text: GameText

    constructor(private char: Char) {
        this.text = new GameText(
            '',
            0,
            -50,
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
        return `morale: ${this.char.morale} / ${this.char.maxMorale}`
    }

    show() {
        this.text.setText(this.getText());
    }

    hide() {
        this.text.setText('');
    }
}