import {FC} from "react";
import {MenuTemplate} from "../components/menu-template";
import {MenuButton} from "../components/menu-button";
import {MenuNavButton} from "../components/menu-nav-button";
import {MenuScreen} from "../../../managers/core/menu";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";


export const MainMenu: FC = () => {
    return <MenuTemplate title="Main Menu">
        <MenuButton onClick={() => o_.menu.closeMenu()} label={o_.texts.t(Txt.Resume)}/>
        <MenuNavButton to={MenuScreen.SETTINGS} label={o_.texts.t(Txt.Settings)}/>
        <MenuNavButton to={MenuScreen.NEW_GAME} label={o_.texts.t(Txt.NewGame)}/>
        <MenuNavButton to={MenuScreen.HOW_TO_PLAY} label={o_.texts.t(Txt.HowToPlay)}/>
    </MenuTemplate>
}