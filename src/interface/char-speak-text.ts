import {render} from "../managers/render";
import {colors} from "../constants";
import {Container, GameText} from "../type-aliases";

export class CharSpeakText {
    isShown = true;

    text: GameText

    timeout: number | null = null

    constructor(private container: Container) {
        this.text = render.createText(
            '',
            120,
            -10,
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
        // this.text.anchor.set(0.5, 1);
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    showText(text: string, timeout?: number) {
        this.text.text = text;

        if (timeout) {
            this.clearTimeout();
            this.timeout = window.setTimeout(() => this.hideText(), 2000);
        }
    }

    hideText() {
        this.text.text = '';
    }
}