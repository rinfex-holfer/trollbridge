import {FC, useState} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {format} from "date-fns";
import {MenuScreen} from "../../../managers/core/menu";

export const SaveMenu: FC = () => {
    const [saves, setSaves] = useState(o_.saves.getSaves())

    return <MenuTemplate title={o_.texts.t(Txt.SaveMenu)} withBackButton>
        <div className='save-menu'>
            {saves.map((save, i) => {
                const dateStr = save.isEmpty ? '' : format(new Date(save._meta.timestamp), "yyyy-MM-dd HH:mm");

                return <SaveSlot
                    key={i}
                    index={i}
                    title={o_.texts.t(save.isEmpty ? Txt.SaveSlotEmpty : Txt.SavedGame)}
                    timestamp={dateStr}
                    onSave={() => {
                        if (save.isEmpty) {
                            o_.saves.save(i);
                            setSaves(o_.saves.getSaves());
                        } else {
                            o_.menu.openMenu(MenuScreen.ARE_YOU_SURE_OVERWRITE, {
                                saveFileToOverwrite: save, onOverwrite: () => {
                                    o_.saves.save(i);
                                    o_.menu.closeMenu();
                                }
                            });
                        }
                    }}
                    onDelete={save.isEmpty ? undefined : () => {
                        o_.menu.openMenu(MenuScreen.ARE_YOU_SURE_DELETE, {
                            saveFileToDelete: save, onDelete: () => {
                                o_.saves.delete(i);
                                o_.menu.closeMenu();
                            }
                        });
                    }}
                />
            })}
        </div>
    </MenuTemplate>
}