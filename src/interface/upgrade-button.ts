import {Vec} from "../utils/utils-math";
import {ImgButton} from "./basic/img-button";
import {o_} from "../managers/locator";

export class UpgradeButton {
    button: ImgButton
    cost: number
    constructor(pos: Vec, cost: number, text: string, private onClickCb: (btn: UpgradeButton) => void) {
        this.cost = cost

        this.button = new ImgButton({
            img: 'button_upgrade',
            x: pos.x,
            y: pos.y,
            text: text + ', стоимость: ' + cost + ' золота',
            onClick: () => this.onClick()
        })
        this.button.text.obj.setWordWrapWidth(200)
    }

    onClick() {
        this.onClickCb(this)
    }

    destroy() {
        this.button.destroy()
    }

    setVisible(val: boolean) {
        this.button.setVisible(val)
        if (o_.lair.treasury.amount < this.cost) {
            this.button.disable()
        } else {
            this.button.enable()
        }
    }
}