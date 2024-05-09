import {useState} from "react";

enum MenuScreen {
    MAIN = "MAIN",
    SETTINGS = "SETTINGS",
    HOW_TO_PLAY = "HOW_TO_PLAY",
    GAME_OVER = "GAME_OVER",
    SAVE = "SAVE",
    LOAD = "LOAD"
}

export const Menu = () => {
    const [screen, setScreen] = useState<MenuScreen>()
}