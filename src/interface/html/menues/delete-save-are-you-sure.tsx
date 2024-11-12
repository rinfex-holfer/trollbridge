import {FC, useState} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {format} from "date-fns";
import {SaveData} from "../../../managers/save-manager";
import {MenuButton} from "../components/menu-button";

export const DeleteSaveAreYouSure: FC<{
    saveFileToDelete: SaveData
    onDelete: () => void
    onCancel: () => void
}> = ({
          saveFileToDelete,
          onDelete,
          onCancel
      }) => {
    return <MenuTemplate
        title={o_.texts.t(Txt.SaveDelete)}
        subtitle={o_.texts.t(Txt.SaveWillBeDeleted, {save: format(new Date(saveFileToDelete._meta.timestamp), "yyyy-MM-dd HH:mm")})}
        isHorizontal
    >
        <MenuButton onClick={onDelete} label={o_.texts.t(Txt.Delete)}/>
        <MenuButton onClick={onCancel} label={o_.texts.t(Txt.Cancel)}/>
    </MenuTemplate>
}