import {o_} from "../locator";
import {Vec} from "../../utils/utils-math";
import {UpgradeButton} from "../../interface/upgrade-button";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {ImgButton} from "../../interface/basic/img-button";
import {positioner} from "./positioner";
import {LayerKey} from "../core/layers";
import {colorsCSS} from "../../configs/constants";
import {SOUND_KEY} from "../core/audio";

export class UpgradeManager {
    buttons: UpgradeButton[] = []

    buildBtn: ImgButton

    upgradeButtonsShown = false

    unsubFromLClick: () => void = stub
    unsubFromRClick: () => void = stub

    constructor() {
        o_.register.upgrade(this)

        const pos = positioner.getBuildButtonPosition()
        this.buildBtn = new ImgButton({
            text: 'постройки',
            img: 'button_upgrade',
            x: pos.x,
            y: pos.y,
            onClick: () => this.onBuildButtonClick(), style: {fill: colorsCSS.WHITE}
        })

        this.buildBtn.sprite.onPointerOver(() => {
            this.buildBtn.text.setVisibility(true)
        })
        this.buildBtn.sprite.onPointerOut(() => {
            this.buildBtn.text.setVisibility(false)
        })

        this.buildBtn.text.setVisibility(false)

        o_.layers.add(this.buildBtn.container, LayerKey.FIELD_BUTTONS)
    }

    public setEnabled(val: boolean) {
        this.buildBtn.setVisible(val)
    }

    private onBuildButtonClick() {
        if (this.upgradeButtonsShown) {
            o_.audio.playSound(SOUND_KEY.BONK)
            this.setButtonsShown(false)
        } else {
            o_.audio.playSound(SOUND_KEY.BONK)
            this.setButtonsShown(true)
        }
    }

    private setButtonsShown(val: boolean) {
        if (val) {
            const close = () => {
                console.log('close')
                o_.audio.playSound(SOUND_KEY.BONK)
                this.setButtonsShown(false)
            }
            o_.interaction.setLayerUnderButtonsActive(close)
            this.unsubFromRClick = o_.interaction.onRightClick(close)

            o_.interaction.disableEverything()
            this.setEnabled(true)
        } else {
            o_.interaction.setLayerUnderButtonsUnactive()
            o_.interaction.enableEverything()
            this.unsubFromRClick?.()
            this.unsubFromRClick = stub

            this.unsubFromLClick?.()
            this.unsubFromLClick = stub
        }
        this.upgradeButtonsShown = val
        this.buttons.forEach(b => b.setVisible(val))
    }

    private onUpgraded(btn: UpgradeButton) {
        o_.audio.playSound(SOUND_KEY.COLLECT)
        o_.lair.treasury.removeGold(btn.cost)
        btn.destroy()
        findAndSplice(this.buttons, btn)
        this.setButtonsShown(false)
    }

    public createUpgradeButton(pos: Vec, text: string, cost: number, upgradeFn: () => void) {
        const btn = new UpgradeButton(pos, cost, text, (b: UpgradeButton) => {
            o_.audio.playSound(SOUND_KEY.UPGRADE)
            upgradeFn()
            this.onUpgraded(b)
        })
        btn.setVisible(false)
        o_.layers.add(btn.button.container, LayerKey.FIELD_BUTTONS)
        this.buttons.push(btn)
        return btn
    }
}