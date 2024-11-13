import {FC, useState} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {format} from "date-fns";
import {SaveData} from "../../../managers/save-manager";
import {MenuButton} from "../components/menu-button";

export const LoadGameAreYouSure: FC<{
    saveDataToLoad: SaveData
    onLoad: () => void
}> = ({
          saveDataToLoad,
          onLoad
      }) => {
    const subtitle = o_.texts.t(Txt.LoadGameProgressWillBeLost);
    return <MenuTemplate
        title={o_.texts.t(Txt.LoadMenu)}
        subtitle={subtitle}
        isHorizontal
    >
        <MenuButton onClick={onLoad} label={o_.texts.t(Txt.Yes)}/>
        <MenuButton onClick={() => o_.menu.closeMenu()} label={o_.texts.t(Txt.Cancel)}/>
    </MenuTemplate>
}