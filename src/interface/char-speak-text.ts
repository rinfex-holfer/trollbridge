import {render} from "../managers/render";
import {colors} from "../constants";
import * as PIXI from "pixi.js";
import {Container} from "../type-aliases";
import {lair} from "../managers/lair";
import {bridgeManager} from "../managers/bridge-manager";

export class CharSpeakText {
    isShown = true;

    text: PIXI.Text

    constructor(private container: Container) {
        this.text = render.createText(
            '',
            120,
            -50,
            {
                align: 'center',
                fill: colors.WHITE,
                fontStyle: 'italic',
                wordWrapWidth: 200,
                fontSize: 18,
                wordWrap: true
            },
            container
        )
        this.text.anchor.set(0.5, 1);
    }

    showText(text: string) {
        this.text.text = text;
    }

    hideText() {
        this.text.text = '';
    }
}