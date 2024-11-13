import {useSyncExternalStore} from "react";
import {o_} from "../../managers/locator";
import {MainMenu} from "./menues/main-menu";
import {SettingsMenu} from "./menues/settings-menu";
import {HowToPlayMenu} from "./menues/how-to-play-menu";
import {GameOver} from "./game-over";
import {eventBus, Evt} from "../../event-bus";
import {MenuParams, MenuScreen} from "../../managers/core/menu";
import {SaveMenu} from "./menues/save-menu";
import {NewGameMenu} from "./menues/new-game-menu";
import {SaveMenuAreYouSure} from "./menues/save-menu-are-you-sure";
import {DeleteSaveAreYouSure} from "./menues/delete-save-are-you-sure";
import {LoadMenu} from "./menues/load-menu";
import {LoadGameAreYouSure} from "./menues/load-game-are-you-sure";

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
    const [menuScreen, params] = useSyncExternalStore<[MenuScreen, MenuParams]>(subscribe, getMenuScreen)

    return getMenu(menuScreen, params)
}

const getMenu = (screen: MenuScreen, params: MenuParams) => {
    switch (screen) {
        case MenuScreen.MAIN:
            return <MainMenu {...params} />
        case MenuScreen.SETTINGS:
            return <SettingsMenu {...params} />
        case MenuScreen.HOW_TO_PLAY:
            return <HowToPlayMenu {...params} />
        case MenuScreen.GAME_OVER:
            return <GameOver {...params}/>
        case MenuScreen.SAVE:
            return <SaveMenu {...params}/>
        case MenuScreen.NEW_GAME:
            return <NewGameMenu {...params}/>
        case MenuScreen.LOAD:
            return <LoadMenu {...params}/>
        case MenuScreen.ARE_YOU_SURE_OVERWRITE:
            return <SaveMenuAreYouSure {...params}/>
        case MenuScreen.ARE_YOU_SURE_DELETE:
            return <DeleteSaveAreYouSure {...params}/>
        case MenuScreen.ARE_YOU_SURE_LOAD:
            return <LoadGameAreYouSure {...params}/>
        case undefined:
            return null
    }
}