import {render} from "../managers/render";
import {colors} from "../constants";
import * as PIXI from "pixi.js";
import {Container} from "../type-aliases";
import {Char} from "../char/Char";

export class CharHpIndicator {
    isShown = false;

    text: PIXI.Text

    constructor(private char: Char) {
        this.text = render.createText(
            '',
            0,
            -120,
            {
                align: 'center',
                fill: colors.WHITE,
                fontSize: 14,
            },
            char.container
        )
        this.text.anchor.set(0.5, 1);
    }

    update() {
        this.show();
    }

    getText() {
        return `HP: ${this.char.hp} / ${this.char.maxHp}`
    }

    show() {
        this.text.text = this.getText();
    }

    hide() {
        this.text.text = ''
    }
}