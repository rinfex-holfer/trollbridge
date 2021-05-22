import {colors, colorsCSS} from "../constants";
import {O_Text} from "../managers/core/render/text";
import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";

export class CharSpeakText {
    text: O_Text

    timeout: number | null = null

    constructor(private container: O_Container) {
        this.text = o_.render.createText(
            '',
            -120,
            -50,
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