import {FC} from "react";
import {MenuButton} from "./menu-button";
import {o_} from "../../../managers/locator";
import {MenuScreen} from "../../../managers/core/menu";


export const MenuNavButton: FC<{ label: string, to: MenuScreen }> = ({
                                                                         label, to
                                                                     }) => {
    return <MenuButton onClick={() => o_.menu.openMenu(to)} label={label}/>
}