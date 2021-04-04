import i18n from 'i18next';

export enum Language {
    EN = 'en',
    RU = 'ru'
}

export default i18n
    .init({
        resources: {
            [Language.EN]: {
                translation: {
                    "Main Menu": "Main Menu",
                    "Settings": "Settings",
                    "Pause": "Pause",
                    "Start Game": "Start Game",
                    "Resume": "Resume",
                    "Language": "Language",
                    "Back": "Back",
                    "Loading": "Loading",
                    "Sound Volume": "Sound Volume",
                    "Music Volume": "Music Volume",
                    "Chars": {
                        "Farmer": "peasant"
                    },
                    "wait": "Wait",
                }
            },
            [Language.RU]: {
                translation: {
                    "Main Menu": "Главное Меню",
                    "Settings": "Настройки",
                    "Pause": "Пауза",
                    "Start Game": "Начать игру",
                    "Resume": "Продолжить",
                    "Language": "Язык",
                    "Back": "Назад",
                    "Loading": "Загрузка",
                    "Sound Volume": "Громкость звука",
                    "Music Volume": "Громкость музыки",
                    "Chars": {
                        "Farmer": "крестьянин"
                    },
                    "wait": "Ждать",
                }
            }
        },
        lng: Language.EN,
        fallbackLng: Language.EN,

        interpolation: {
            escapeValue: false
        }
    });