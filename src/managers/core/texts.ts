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
    // common

    Gold: "gold",


    Pause: "Pause",
    StartGame: "StartGame",
    Resume: "Resume",
    Language: "Language",
    Back: "Back",
    Loading: "Loading",
    SoundVolume: "SoundVolume",
    MusicVolume: "MusicVolume",
    CharsFarmer: "CharsFarmer",
    Wait: "Wait",

    // menues
    MainMenu: "MainMenu",
    Settings: "Settings",
    SaveMenu: "SaveMenu",
    HowToPlay: "HowToPlay",

    // buildings
    UpgradeCost1: "Cost:",
    UpgradeBridge: "UpgradeBridge",
    UpgradeChair: "UpgradeChair",
    UpgradeBed: "UpgradeBed",
    BuildGoblinsLair: "BuildGoblinsLair",
    UpgradePot: "UpgradePot",
    UpgradeDryingRack: "UpgradeDryingRack",
} as const

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
            [Txt.UpgradeChair]: "Chair upgrade: restores more health",
            [Txt.UpgradePot]: "Craft a pot: can prepare food",
            [Txt.UpgradeBed]: "Bed upgrade: restores more health",
            [Txt.UpgradeDryingRack]: "Drying rack upgrade: stores more food",
        } as const
    } as const,
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
            [Txt.UpgradeChair]: "Улучшить: восстанавливает больше здоровья",
            [Txt.UpgradePot]: "Сделать котел: можно готовить пищу",
            [Txt.UpgradeBed]: "Улучшить: восстанавливает больше здоровья",
            [Txt.UpgradeDryingRack]: "Улучшить: вмещает больше еды",
        } as const
    } as const
}