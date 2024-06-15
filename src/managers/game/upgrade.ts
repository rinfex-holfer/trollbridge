import {o_} from "../locator";
import {Vec} from "../../utils/utils-math";
import {UpgradeButton} from "../../interface/upgrade-button";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {LayerKey} from "../core/layers";
import {SOUND_KEY} from "../core/audio";
import {TextKey} from "../core/texts";

export class UpgradeManager {
    buttons: UpgradeButton[] = []

    upgradeButtonsShown = false

    unsubFromLClick: () => void = stub
    unsubFromRClick: () => void = stub

    constructor() {
        o_.register.upgrade(this)
    }

    public showButtons(onCloseClicked: () => void) {
        o_.audio.playSound(SOUND_KEY.BONK)

        // not a cool UX?
        // o_.interaction.setLayerUnderButtonsActive(onCloseClicked)

        this.unsubFromRClick = o_.interaction.onRightClick(onCloseClicked)
        this.setButtonsShown(true)
    }

    public hideButtons() {
        if (!this.upgradeButtonsShown) return

        o_.audio.playSound(SOUND_KEY.BONK)

        o_.interaction.setLayerUnderButtonsUnactive()
        // o_.interaction.enableEverything()
        this.unsubFromRClick?.()
        this.unsubFromRClick = stub

        this.unsubFromLClick?.()
        this.unsubFromLClick = stub

        this.setButtonsShown(false)
    }

    private setButtonsShown(val: boolean) {
        this.upgradeButtonsShown = val
        this.buttons.forEach(b => b.setVisible(val))
    }

    public createUpgradeButton(
        pos: Vec,
        textKey: TextKey,
        cost: number,
        upgradeFn: () => void,
        checkIsLastUpgrade: () => boolean = () => true
    ) {
        const btn = new UpgradeButton(pos, cost, textKey, (b: UpgradeButton) => {
            o_.audio.playSound(SOUND_KEY.UPGRADE)
            upgradeFn()

            o_.audio.playSound(SOUND_KEY.COLLECT)
            o_.lair.treasury.removeGold(btn.cost)
            if (checkIsLastUpgrade()) {
                btn.destroy()
                findAndSplice(this.buttons, btn)
            }
        })
        btn.setVisible(false)
        o_.layers.add(btn.button.container, LayerKey.FIELD_BUTTONS)
        this.buttons.push(btn)
        return btn
    }
}