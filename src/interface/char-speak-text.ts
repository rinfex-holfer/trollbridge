import {colors, colorsCSS} from "../configs/constants";
import {O_Text} from "../managers/core/render/text";
import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {Txt} from "../translations";

export class CharSpeakText {
    text: O_Text

    timeout: number | null = null

    constructor(private container: O_Container) {
        this.text = o_.render.createText(
            {
                x: -150,
                y: -50,
                textKey: '',
                style: {
                    align: 'center',
                    color: colorsCSS.WHITE,
                    fontStyle: 'italic',
                    fontSize: '18px',
                    wordWrap: {width: 300}
                },
                parent: container
            }
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