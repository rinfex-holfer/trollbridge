import {SimpleButton} from "./basic/simple-button";
import {timeManager} from "../managers/time-manager";
import i18next from "i18next";
import {Vec} from "../utils/utils-math";

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
        // characters.removeTravellers()
        timeManager.wait();
    }

    enable() {
        this.button.enable();
    }

    disable() {
        this.button.disable();
    }
}