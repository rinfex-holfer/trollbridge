import {useSyncExternalStore} from "react";
import {o_} from "../../managers/locator";
import {MainMenu} from "./menues/main-menu";
import {SettingsMenu} from "./menues/settings-menu";
import {HowToPlayMenu} from "./menues/how-to-play-menu";
import {GameOver} from "./game-over";
import {eventBus, Evt} from "../../event-bus";
import {MenuScreen} from "../../managers/core/menu";
import {SaveMenu} from "./menues/save-menu";
import {NewGameMenu} from "./menues/new-game-menu";

const subscribe = (callback: VoidFunction) => {
    const id = eventBus.on(Evt.INTERFACE_MENU_SCREEN_CHANGED, callback)

    return () => {
        eventBus.unsubscribe(Evt.INTERFACE_MENU_SCREEN_CHANGED, id)
    }
};
const getMenuScreen = () => {
    return o_.menu.currentScreen
}

export const Menu = () => {
    const menuScreen = useSyncExternalStore<MenuScreen>(subscribe, getMenuScreen)

    return getMenu(menuScreen)
}

const getMenu = (screen: MenuScreen) => {
    switch (screen) {
        case MenuScreen.MAIN:
            return <MainMenu/>
        case MenuScreen.SETTINGS:
            return <SettingsMenu/>
        case MenuScreen.HOW_TO_PLAY:
            return <HowToPlayMenu/>
        case MenuScreen.GAME_OVER:
            return <GameOver/>
        case MenuScreen.SAVE:
            return <SaveMenu/>
        case MenuScreen.NEW_GAME:
            return <NewGameMenu/>
        case MenuScreen.LOAD:
        case undefined:
            return null
    }
}