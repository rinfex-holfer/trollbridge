import {SimpleButton} from "./basic/simple-button";
import i18next from "i18next";
import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";

export class WaitButton {
    button: SimpleButton

    constructor(lairPos: Vec) {
        this.button = new SimpleButton({
            text: i18next.t('wait'),
            x: lairPos.x + 20,
            y: lairPos.y + 20,
            onClick: () => this.onClick()
        })
    }

    onClick() {
        o_.time.wait();
    }

    setEnabled(val: boolean) {
        if (val) {
            this.button.enable()
        } else {
            this.button.disable();
        }
    }
}