import i18n from 'i18next';

export enum Language {
    EN = 'en',
    RU = 'ru'
}

export type TextKey = typeof Txt[keyof typeof Txt]
export const Txt = {
    // common
    Empty: "",

    Gold: "gold",

    No: "No",
    Yes: "Yes",
    Cancel: "Cancel",

    NewGame: "NewGame",
    StartNewGame: "StartNewGame",
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

    // lair
    NotEnoughMeat: "NotEnoughMeat",

    // buildings
    UpgradeTitle: "Upgrade",
    BuildTitle: "Build",

    UpgradeCost: "UpgradeCost",
    UpgradeCostNotEnoughMoney: "UpgradeCostNotEnoughMoney",

    UpgradeBridge: "UpgradeBridge",
    UpgradeChairTitle: "UpgradeChairTitle",
    UpgradeChair: "UpgradeChair",
    UpgradeBedTitle: "UpgradeBedTitle",
    UpgradeBed: "UpgradeBed",
    BuildGoblinsLair: "BuildGoblinsLair",
    UpgradePotTitle: "UpgradePotTitle",
    UpgradePotDescr: "UpgradePotDescr",

    UpgradeTreasuryTitle: "UpgradeTreasuryTitle",
    UpgradeTreasuryDescr: "UpgradeTreasuryDescr",

    BuildDryingRackTitle: "BuildDryingRackTitle",
    UpgradeDryingRackTitle: "UpgradeDryingRackTitle",
    BuildDryingRackText: "BuildDryingRackText",
    UpgradeDryingRackText: "UpgradeDryingRackText",
} as const
export const translations = {
    [Language.EN]: {
        translation: {
            [Txt.Yes]: "Yes",
            [Txt.No]: "No",
            [Txt.Cancel]: "Cancel",
            [Txt.Empty]: "",
            [Txt.Loading]: "Loading",
            [Txt.NewGame]: "New game",
            [Txt.StartNewGame]: "Start new game",

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

            // lair
            [Txt.NotEnoughMeat]: "You need 3 meat peaces to prepare a dish",

            // buildings
            [Txt.UpgradeTitle]: "Upgrade",
            [Txt.BuildTitle]: "Build",

            [Txt.UpgradeCost]: "Cost: {{amount}} gold",
            [Txt.UpgradeCostNotEnoughMoney]: " (not enough!)",

            [Txt.UpgradeChair]: "Restores more health",
            [Txt.UpgradeChairTitle]: "Upgrade chair",
            [Txt.UpgradePotTitle]: "Build pot",
            [Txt.UpgradePotDescr]: "Can prepare food",

            [Txt.UpgradeBedTitle]: "Upgrade bed",
            [Txt.UpgradeBed]: "Restores more health",

            [Txt.UpgradeTreasuryTitle]: "Upgrade treasury",
            [Txt.UpgradeTreasuryDescr]: "Becomes more secure",

            [Txt.BuildDryingRackTitle]: "Build food storage",
            [Txt.BuildDryingRackText]: "Stores food so it doesn't go bad too quick",
            [Txt.UpgradeDryingRackTitle]: "Expand food storage",
            [Txt.UpgradeDryingRackText]: "Stores more food",
        } as const
    } as const,
    [Language.RU]: {
        translation: {
            [Txt.Yes]: "Да",
            [Txt.No]: "Нет",
            [Txt.Cancel]: "Отмена",

            [Txt.Empty]: "",
            [Txt.Loading]: "Загрузка",
            [Txt.NewGame]: "Новая игра",
            [Txt.StartNewGame]: "Начать новую игру",

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

            // lair
            [Txt.NotEnoughMeat]: "Чтобы приготовить блюдо, нужно 3 единицы мяса",

            // buildings
            [Txt.UpgradeTitle]: "Улучшить",
            [Txt.BuildTitle]: "Построить",
            [Txt.UpgradeCost]: "Цена: {{amount}} золота",
            [Txt.UpgradeCostNotEnoughMoney]: " (не достаточно!)",

            [Txt.UpgradeChairTitle]: "Улучшить стул",
            [Txt.UpgradeChair]: "Восстанавливает больше здоровья",
            [Txt.UpgradePotDescr]: "Можно готовить пищу",
            [Txt.UpgradeBedTitle]: "Улучшить кровать",
            [Txt.UpgradeBed]: "Восстанавливает больше здоровья",
            [Txt.UpgradeTreasuryTitle]: "Улучшить сокровищницу",
            [Txt.UpgradeTreasuryDescr]: "Становится более надежной",

            [Txt.BuildDryingRackTitle]: "Построить хранилище еды",
            [Txt.BuildDryingRackText]: "Хранящаяся там еда дольше остается свежей",
            [Txt.UpgradeDryingRackTitle]: "Расширить хранилище еды",
            [Txt.UpgradeDryingRackText]: "Вмещает больше еды",
        } as const
    } as const
}
export default i18n
    .init({
        resources: {
            ...translations
        },
        lng: Language.EN,
        fallbackLng: Language.EN,

        interpolation: {
            escapeValue: false
        }
    });