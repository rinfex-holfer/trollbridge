import {Container, GameText, render} from "../managers/render";
import {colors, colorsCSS} from "../constants";

export class CharSpeakText {
    text: GameText

    timeout: number | null = null

    constructor(private container: Container) {
        this.text = new GameText(
            '',
            120,
            -10,
            {
                align: 'center',
                color: colorsCSS.WHITE,
                fontStyle: 'italic',
                fontSize: '18px',
                wordWrap: {width: 200}
            },
            {parent: container}
        )
        this.text.setOrigin(0.5, 1);
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    showText(text: string, timeout?: number) {
        this.text.setText(text);

        if (timeout) {
            this.clearTimeout();
            this.timeout = window.setTimeout(() => this.hideText(), timeout);
        }
    }

    hideText() {
        this.text.setText('');
    }

    destroy() {
        this.clearTimeout();
    }
}