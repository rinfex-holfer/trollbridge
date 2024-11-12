import {FC, useState} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {format} from "date-fns";
import {SaveMenuAreYouSure} from "./save-menu-are-you-sure";
import {DeleteSaveAreYouSure} from "./delete-save-are-you-sure";

export const SaveMenu: FC = () => {
    const [saves, setSaves] = useState(o_.saves.getSaves())
    const [saveToOverwriteIdx, setSaveToOverwriteIdx] = useState<number | null>(null)
    const [saveToDeleteIdx, setSaveToDeleteIdx] = useState<number | null>(null)

    if (saveToOverwriteIdx !== null) {
        const saveToOverwrite = saves[saveToOverwriteIdx];

        if (saveToOverwrite && !saveToOverwrite.isEmpty) {
            return <SaveMenuAreYouSure
                saveFileToOverwrite={saveToOverwrite}
                onOverwrite={() => {
                    o_.saves.save(saveToOverwriteIdx);
                    setSaves(o_.saves.getSaves());
                    setSaveToOverwriteIdx(null);
                }}
                onCancel={() => setSaveToOverwriteIdx(null)}
            />
        }
    }

    if (saveToDeleteIdx !== null) {
        const saveToDelete = saves[saveToDeleteIdx];

        if (saveToDelete && !saveToDelete.isEmpty) {
            return <DeleteSaveAreYouSure
                saveFileToDelete={saveToDelete}
                onDelete={() => {
                    o_.saves.delete(saveToDeleteIdx);
                    setSaves(o_.saves.getSaves());
                    setSaveToDeleteIdx(null);
                }}
                onCancel={() => setSaveToDeleteIdx(null)}
            />
        }
    }

    return <MenuTemplate title={o_.texts.t(Txt.SaveMenu)}>
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
                            setSaveToOverwriteIdx(i);
                        }
                    }}
                    onDelete={save.isEmpty ? undefined : () => {
                        setSaveToDeleteIdx(i);
                    }}
                />
            })}
        </div>
    </MenuTemplate>
}