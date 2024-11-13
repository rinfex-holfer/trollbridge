import {FC, useState} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {format} from "date-fns";
import {SaveData} from "../../../managers/save-manager";
import {MenuButton} from "../components/menu-button";

export const SaveMenuAreYouSure: FC<{
    saveFileToOverwrite: SaveData
    onOverwrite: () => void
}> = ({
          saveFileToOverwrite,
          onOverwrite,
      }) => {
    const subtitle = o_.texts.t(Txt.SaveWillBeOverwritten, {save: format(new Date(saveFileToOverwrite._meta.timestamp), "yyyy-MM-dd HH:mm")});
    return <MenuTemplate
        title={o_.texts.t(Txt.SaveMenuOverwrite)}
        subtitle={subtitle}
        isHorizontal
    >
        <MenuButton onClick={onOverwrite} label={o_.texts.t(Txt.Yes)}/>
        <MenuButton onClick={() => o_.menu.closeMenu()} label={o_.texts.t(Txt.Cancel)}/>
    </MenuTemplate>
}