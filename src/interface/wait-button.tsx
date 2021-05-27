import {SimpleButton} from "./basic/simple-button";
import i18next from "i18next";
import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";
import {positioner} from "../managers/game/positioner";

export class WaitButton {
    button: SimpleButton

    constructor() {
        const lairPos = positioner.getBuildButtonPosition()
        this.button = new SimpleButton({
            text: i18next.t('wait'),
            x: lairPos.x - 20,
            y: lairPos.y + 100,
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