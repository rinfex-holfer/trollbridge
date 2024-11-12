import {PotData} from "../entities/buildings/pot";
import {o_} from "./locator";
import {debugExpose} from "../utils/utils-misc";
import {ChairData} from "../entities/buildings/chair";
import {BedData} from "../entities/buildings/bed";
import {FoodStorageData} from "../entities/buildings/food-storage";
import {ItemsData} from "./game/items";
import {TreasuryData} from "../entities/buildings/treasury";

const LS_KEY = "trbr_save"

const gameVersion = "0.2.1"

export type SaveData = {
    isEmpty: false

    _meta: {
        gameVersion: typeof gameVersion
        timestamp: string
    }

    lair: {
        chair: ChairData
        bed: BedData
        pot: PotData
        foodStorage: FoodStorageData
        treasury: TreasuryData
    }

    items: ItemsData
}

export type SaveDataEmpty = {
    isEmpty: true
}

type SaveList = (SaveData | SaveDataEmpty)[]

const MAX_SAVES = 10

export class SaveManager {
    constructor() {
        debugExpose(() => this, 'saveManager')
        o_.register.saves(this)
    }

    static isSaveEmpty = (save: SaveData | SaveDataEmpty): save is SaveDataEmpty => !!save.isEmpty

    save(slot: number) {
        const saveData: SaveData = {
            isEmpty: false,
            _meta: {
                gameVersion,
                timestamp: (new Date()).toString()
            },
            lair: {
                chair: o_.lair.chair.getData(),
                bed: o_.lair.bed.getData(),
                pot: o_.lair.pot.getData(),
                foodStorage: o_.lair.foodStorage.getData(),
                treasury: o_.lair.treasury.getData(),
            },
            items: o_.items.getData(),
        }

        const savesList = this.getSaves()

        savesList[slot] = saveData

        localStorage.setItem(LS_KEY, JSON.stringify(savesList))
    }

    delete(slot: number) {
        const savesList = this.getSaves()

        savesList[slot] = {isEmpty: true}

        localStorage.setItem(LS_KEY, JSON.stringify(savesList))
    }

    cleanupSavesStorage() {
        localStorage.setItem(LS_KEY, '');
    }

    getSaves(): SaveList {
        const emptySavesList: SaveDataEmpty[] = Array.from({length: MAX_SAVES}, () => ({isEmpty: true}));

        const saveDataStr = localStorage.getItem(LS_KEY)
        if (!saveDataStr) return emptySavesList

        let savesList: SaveList
        try {
            savesList = JSON.parse(saveDataStr)
        } catch (e) {
            return emptySavesList
        }

        console.log("savesList", savesList)

        savesList = savesList.map(save => {
            if (SaveManager.isSaveEmpty(save)) return save

            if (save._meta.gameVersion !== gameVersion) {
                return {isEmpty: true}
            }

            return save
        })

        return savesList
    }

    getLatestSave(): SaveData | undefined {
        const saves = this.getSaves()
        const nonEmptySaves: SaveData[] = saves.filter((save): save is SaveData => !SaveManager.isSaveEmpty(save))
        return nonEmptySaves
            .sort((a, b) => {
                return new Date(b._meta.timestamp).getTime() - new Date(a._meta.timestamp).getTime()
            })[0]
    }
}
