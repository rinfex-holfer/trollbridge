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
    titleTextKey?: TextKey
    descriptionTextKey?: TextKey
    canBeUpgraded: () => boolean
    getUpgradeCost: () => number
    upgrade: () => void
    getData: () => UpgradableComponentData
    init: () => void
}

export type UpgradableComponentData = {
    level: number
}

// это пиздец конечно месиво, так не планировалось
export const createUpgradableComponent = (
    host: UpgradableEntity,
    props?: Partial<UpgradableComponent>,
): UpgradableComponent => {
    const cmp = () => host.cmp.upgradable

    const defaults: UpgradableComponent = {
        buttonCoord: {x: 100, y: 100},

        level: 0,

        titleTextKey: Txt.UpgradeTitle,

        canBeUpgraded: () => false,

        getUpgradeCost: () => 0,

        upgrade: () => void 0,

        getData: () => ({
            level: cmp().level
        }),

        init: () => {
            const btn = new UpgradeButton((b: UpgradeButton) => {
                o_.audio.playSound(SOUND_KEY.UPGRADE)
                cmp().upgrade()

                o_.audio.playSound(SOUND_KEY.COLLECT)
                o_.lair.treasury.removeGold(cmp().getUpgradeCost())
                if (!cmp().canBeUpgraded()) {
                    btn.destroy()
                    o_.upgrade.unregister(cmp())
                }
            }, host)

            btn.setVisible(false)

            cmp().button = btn

            o_.upgrade.register(cmp())

            if (!cmp().canBeUpgraded()) {
                btn.destroy()
                o_.upgrade.unregister(cmp())
            }
        }
    }

    return {
        ...defaults,
        ...props,
    }
}
