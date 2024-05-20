import {FC} from "react";
import {MenuTemplate} from "../components/menu-template";
import {MenuButton} from "../components/menu-button";
import {MenuNavButton} from "../components/menu-nav-button";
import {MenuScreen} from "../../../managers/core/menu";
import {o_} from "../../../managers/locator";


export const MainMenu: FC = () => {
    return <MenuTemplate title="Main Menu">
        <MenuButton onClick={() => o_.menu.closeMenu()} label={"Continue"}/>
        <MenuNavButton to={MenuScreen.SETTINGS} label={"Settings"}/>
        <MenuNavButton to={MenuScreen.HOW_TO_PLAY} label={"How to play"}/>
    </MenuTemplate>
}