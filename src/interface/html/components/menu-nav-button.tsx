import {FC} from "react";
import {MenuButton} from "./menu-button";
import {o_} from "../../../managers/locator";
import {MenuParams, MenuScreen} from "../../../managers/core/menu";


export const MenuNavButton: FC<{ label: string, to: MenuScreen, withParams?: MenuParams }> = ({
                                                                                                  label, to, withParams
                                                                                              }) => {
    return <MenuButton onClick={() => o_.menu.openMenu(to, withParams)} label={label}/>
}