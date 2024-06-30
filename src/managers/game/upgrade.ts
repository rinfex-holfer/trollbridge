import {o_} from "../locator";
import {Vec} from "../../utils/utils-math";
import {UpgradeButton} from "../../interface/upgrade-button";
import {findAndSplice, stub} from "../../utils/utils-misc";
import {SOUND_KEY} from "../core/audio";
import {UpgradableComponent, UpgradableEntity} from "../../components/upgradable";
import {TextKey} from "../../translations";

export class UpgradeManager {
    upgradeButtonsShown = false
    components: UpgradableComponent[] = []

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
        this.components.forEach(c => c.button?.setVisible(val))
    }

    register(upgradable: UpgradableComponent) {
        this.components.push(upgradable)
    }

    unregister(upgradable: UpgradableComponent) {
        findAndSplice(this.components, upgradable)
    }
}