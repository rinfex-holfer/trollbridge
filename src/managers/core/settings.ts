import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";

export const resolutionMap = {
    '1920x1080': [1920, 1080],
    '2560x1440': [2560, 1440],
} as const;
export type Resolution = keyof typeof resolutionMap;

const LS_KEY = 'troll_game_settings';

// TODO validation
const save = (settings: Settings) => localStorage.setItem(LS_KEY, JSON.stringify(settings))
const load = (): Settings => {
    const oldSettingsStr = localStorage.getItem(LS_KEY);
    return oldSettingsStr ? JSON.parse(oldSettingsStr) as Settings : defaultSettings;
}

export type Settings = {
    resolution: Resolution
    fullscreen: boolean
}
const defaultSettings: Settings = {
    resolution: '1920x1080',
    fullscreen: false,
} as const

export class SettingsManager {

    private settings: Settings

    constructor() {
        o_.register.settings(this)
        this.settings = load();
    }

    getSettings(): Readonly<Settings> {
        return this.settings;
    }

    getResolution() {
        return resolutionMap[this.getSettings().resolution];
    }

    patchSettings(settingsPatch: Partial<Settings>) {
        const newSettings = {
            ...this.getSettings(),
            ...settingsPatch
        };
        save(newSettings)
        this.settings = newSettings;

        eventBus.emit(Evt.SETTINGS_CHANGED, newSettings);
    }
}