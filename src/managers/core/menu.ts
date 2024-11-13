import {eventBus, Evt} from "../../event-bus";
import {GameInputEvent} from "./input/domain";
import {o_} from "../locator";
import {GAME_INPUT_EVENT} from "./input/types";
import {reactUiRef} from "../../interface/html/react-ui";

export enum MenuScreen {
    MAIN = "MAIN",
    SETTINGS = "SETTINGS",
    HOW_TO_PLAY = "HOW_TO_PLAY",
    NEW_GAME = "NEW_GAME",
    GAME_OVER = "GAME_OVER",
    SAVE = "SAVE",
    LOAD = "LOAD",
    ARE_YOU_SURE_OVERWRITE = "ARE_YOU_SURE_OVERWRITE",
    ARE_YOU_SURE_DELETE = "ARE_YOU_SURE_DELETE",
    ARE_YOU_SURE_LOAD = "ARE_YOU_SURE_LOAD",
}

export type MenuParams = any;

const NO_MENU = [undefined, undefined]

export class MenuManager {
    private menuStack: [MenuScreen, MenuParams][] = []

    constructor() {
        o_.input.on(GAME_INPUT_EVENT, this.onGameInputEvent)
        o_.register.menu(this)

        reactUiRef.setIsReady(true)
    }

    onGameInputEvent = (e: GameInputEvent) => {
        console.log("onGameInputEvent", e)
        if (e === GameInputEvent.CANCEL) {
            if (this.isOpened) {
                this.closeMenu()
            } else {
                this.openMenu(MenuScreen.MAIN)
            }
        }
    }

    get isOpened() {
        return this.menuStack.length > 0
    }

    get currentScreen() {
        return this.menuStack[this.menuStack.length - 1] || NO_MENU
    }

    openMenu(menuScreen: MenuScreen, menuParams?: MenuParams) {
        const wasOpened = this.isOpened
        this.menuStack.push([menuScreen, menuParams])

        if (!wasOpened && this.isOpened) {
            eventBus.emit(Evt.INTERFACE_MENU_OPENED)

        }
        eventBus.emit(Evt.INTERFACE_MENU_SCREEN_CHANGED, this.currentScreen)
    }

    closeMenu = () => {
        if (!this.isOpened) return

        this.menuStack.pop()

        if (!this.isOpened) eventBus.emit(Evt.INTERFACE_MENU_CLOSED)
        eventBus.emit(Evt.INTERFACE_MENU_SCREEN_CHANGED, this.currentScreen)
    }

    closeAllMenues() {
        this.menuStack = [];
        eventBus.emit(Evt.INTERFACE_MENU_CLOSED)
        eventBus.emit(Evt.INTERFACE_MENU_SCREEN_CHANGED, this.currentScreen)
    }
}