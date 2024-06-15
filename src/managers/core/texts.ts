import {Language} from "../../translations";
import {o_} from "../locator";

export class TextsManager {
    constructor() {
        o_.register.texts(this)
    }

    t(textKey: TextKey): string {
        return translations[Language.RU].translation[textKey] || textKey
    }
}

export type TextKey = typeof Txt[keyof typeof Txt]

export const Txt = {
    Pause: "Pause",
    StartGame: "Start Game",
    Resume: "Resume",
    Language: "Language",
    Back: "Back",
    Loading: "Loading",
    SoundVolume: "Sound Volume",
    MusicVolume: "Music Volume",
    CharsFarmer: "Farmer",
    Wait: "Wait",

    // menues
    MainMenu: "Main Menu",
    Settings: "Settings",
    SaveMenu: "Save game",
    HowToPlay: "How to play",

    // buildings
    UpgradeBridge: "Decorate the bridge",
    UpgradeChair: "Upgrade the chair",
    BuildGoblinsLair: "Build the goblin's lair",
}

export const translations = {
    [Language.EN]: {
        translation: {
            [Txt.Loading]: "Loading",

            // menues
            [Txt.Back]: "Back",
            [Txt.SaveMenu]: "Save game",
            [Txt.MainMenu]: "Main Menu",
            [Txt.HowToPlay]: "How to play",
            [Txt.Pause]: "Pause",
            [Txt.StartGame]: "Start Game",
            [Txt.Resume]: "Resume",

            [Txt.Settings]: "Settings",
            [Txt.Language]: "Language",
            [Txt.SoundVolume]: "Sound Volume",
            [Txt.MusicVolume]: "Music Volume",

            // game interface
            [Txt.Wait]: "Wait",

            // chars
            [Txt.CharsFarmer]: "peasant",

            // buildings
            [Txt.UpgradeChair]: "Upgrade chair",
        }
    },
    [Language.RU]: {
        translation: {
            [Txt.Loading]: "Загрузка",

            // menues

            [Txt.Pause]: "Пауза",
            [Txt.Back]: "Назад",
            [Txt.SaveMenu]: "Сохранение",
            [Txt.MainMenu]: "Главное Меню",
            [Txt.HowToPlay]: "Как играть",

            [Txt.Settings]: "Настройки",
            [Txt.StartGame]: "Начать игру",
            [Txt.Resume]: "Продолжить",
            [Txt.Language]: "Язык",
            [Txt.SoundVolume]: "Громкость звука",
            [Txt.MusicVolume]: "Громкость музыки",

            // game interface
            [Txt.Wait]: "Ждать",

            // chars
            [Txt.CharsFarmer]: "крестьянин",

            // buildings
            [Txt.UpgradeChair]: "Улучшить сидение",
        }
    }
}