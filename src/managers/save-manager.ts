import {PotData} from "../entities/buildings/pot";
import {o_} from "./locator";
import {debugExpose} from "../utils/utils-misc";
import {ChairData} from "../entities/buildings/chair";
import {BedData} from "../entities/buildings/bed";

const LS_KEY = "tb_save"

const gameVersion = "0.1"

export interface SaveData {
    _meta: {
        gameVersion: typeof gameVersion
        timestamp: string
    }

    lair: {
        chair: ChairData
        bed: BedData
        pot: PotData
    }
}

export class SaveManager {
    constructor() {
        debugExpose(() => this, 'saveManager')
        o_.register.saves(this)
    }

    save() {
        const saveData: SaveData = {
            _meta: {
                gameVersion,
                timestamp: (new Date()).toString()
            },
            lair: {
                chair: o_.lair.chair.getData(),
                bed: o_.lair.bed.getData(),
                pot: o_.lair.pot.getData(),
            }
        }

        localStorage.setItem(LS_KEY, JSON.stringify(saveData))
    }

    deleteSave() {
        localStorage.setItem(LS_KEY, '');
    }

    getSaveData() {
        const saveDataStr = localStorage.getItem(LS_KEY)
        if (!saveDataStr) return undefined

        let saveData: SaveData
        try {
            saveData = JSON.parse(saveDataStr)
        } catch (e) {
            return undefined
        }

        if (saveData._meta.gameVersion !== gameVersion) {
            return undefined;
        }

        return saveData
    }
}
