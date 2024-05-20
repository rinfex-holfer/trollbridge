import {FC} from "react";
import {MenuButton} from "./menu-button";
import {o_} from "../../../managers/locator";

export const MenuButtonBack: FC<{}> = () => {
    return <MenuButton onClick={() => o_.menu.closeMenu()} label='Back'/>
}