import {o_} from "../locator";
import {Vec} from "../../utils/utils-math";
import {UpgradeButton} from "../../interface/upgrade-button";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {ImgButton} from "../../interface/basic/img-button";
import {positioner} from "./positioner";
import {LayerKey} from "../core/layers";
import {eventBus, Evt} from "../../event-bus";
import {TrollLocation} from "../../types";
import {colors, colorsCSS} from "../../constants";
import {disableEverything} from "../../helpers";

export class UpgradeManager {
    buttons: UpgradeButton[] = []

    buildBtn: ImgButton

    upgradeButtonsShown = false

    unsubFromRClick: () => void = stub

    constructor() {
        o_.register.upgrade(this)

        const pos = positioner.getBuildButtonPosition()
        this.buildBtn = new ImgButton({
            text: 'улучшить логово',
            img: 'button_upgrade',
            x: pos.x,
            y: pos.y,
            onClick: () => this.onBuildButtonClick(), style: {fill: colorsCSS.WHITE}
        })
        o_.layers.add(this.buildBtn.container, LayerKey.FIELD_BUTTONS)
    }

    public setEnabled(val: boolean) {
        this.buildBtn.setVisible(val)
    }

    private onBuildButtonClick() {
        if (this.upgradeButtonsShown) {
            this.setButtonsShown(false)
        } else {
            this.setButtonsShown(true)
            this.unsubFromRClick = o_.interaction.onRightClick(() => this.setButtonsShown(false))
        }
    }

    private setButtonsShown(val: boolean) {
        this.unsubFromRClick()
        this.upgradeButtonsShown = val
        this.buttons.forEach(b => b.setVisible(val))
    }

    private onUpgraded(btn: UpgradeButton) {
        this.unsubFromRClick()
        btn.destroy()
        findAndSplice(this.buttons, btn)
        this.setButtonsShown(false)
    }

    public createUpgradeButton(pos: Vec, text: string, cost: number, upgradeFn: () => void) {
        const btn = new UpgradeButton(pos, cost, text, (b: UpgradeButton) => {
            upgradeFn()
            this.onUpgraded(b)
        })
        btn.setVisible(false)
        this.buttons.push(btn)
        return btn
    }
}