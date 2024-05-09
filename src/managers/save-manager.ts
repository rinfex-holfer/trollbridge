import {PotProps} from "../entities/buildings/pot";
import {o_} from "./locator";
import {debugExpose} from "../utils/utils-misc";

const LS_KEY = "tb_save"

const gameVersion = "0.1"

interface SaveData {
    _meta: {
        gameVersion: typeof gameVersion
        timestamp: string
    }

    pot: PotProps
}

export class SaveManager {
    static save() {
        const saveData: SaveData = {
            _meta: {
                gameVersion,
                timestamp: (new Date()).toString()
            },
            pot: o_.lair.pot.props
        }

        localStorage.setItem(LS_KEY, JSON.stringify(saveData))
    }

    static load() {
        const saveDataStr = localStorage.getItem(LS_KEY)
        if (!saveDataStr) return null

        let saveData: SaveData
        try {
            saveData = JSON.parse(saveDataStr)
        } catch (e) {
            return null
        }

        if (saveData._meta.gameVersion !== gameVersion) {
            return null;
        }

        return saveData
    }
}
