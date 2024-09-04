import {UpgradeButton} from "../interface/upgrade-button";
import {o_} from "../managers/locator";
import {SOUND_KEY} from "../managers/core/audio";
import {findAndSplice} from "../utils/utils-misc";
import {Vec} from "../utils/utils-math";

import {TextKey, Txt} from "../translations";

export interface UpgradableEntity {
    cmp: {
        // TODO why this should be in cmp object? Better lift it up
        upgradable: UpgradableComponent
    }
}

export type UpgradableComponent = UpgradableComponentData & {
    button?: UpgradeButton
    buttonCoord: Vec
    cost: number
    titleTextKey?: TextKey
    descriptionTextKey?: TextKey
    canBeUpgraded: () => boolean
    upgrade: () => void
    getData: () => UpgradableComponentData
    init: () => void
}

export type UpgradableComponentData = {
    level: number
}

export const createUpgradableComponent = (
    host: UpgradableEntity,
    props?: Partial<UpgradableComponent>,
): UpgradableComponent => {
    const cmp = () => host.cmp.upgradable

    const defaults: UpgradableComponent = {
        buttonCoord: {x: 100, y: 100},

        level: 0,

        cost: 10,

        titleTextKey: Txt.UpgradeTitle,

        canBeUpgraded: () => false,

        upgrade: () => void 0,

        getData: () => ({
            level: cmp().level
        }),

        init: () => {
            const btn = new UpgradeButton((b: UpgradeButton) => {
                o_.audio.playSound(SOUND_KEY.UPGRADE)
                cmp().upgrade()

                o_.audio.playSound(SOUND_KEY.COLLECT)
                o_.lair.treasury.removeGold(btn.cost)
                if (!cmp().canBeUpgraded()) {
                    btn.destroy()
                    o_.upgrade.unregister(cmp())
                }
            }, host)

            btn.setVisible(false)

            cmp().button = btn

            o_.upgrade.register(cmp())
        }
    }

    return {
        ...defaults,
        ...props,
    }
}
