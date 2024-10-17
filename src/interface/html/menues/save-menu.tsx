import {FC} from "react";
import {SaveSlot} from "../components/save-slot";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";

export const SaveMenu: FC = () => {
    const saves = o_.saves.getSaves()

    return <MenuTemplate title={o_.texts.t(Txt.SaveMenu)}>
        <div className='save-menu'>
            {saves.map((save, i) => <SaveSlot
                key={i}
                index={i}
                title={o_.texts.t(save.isEmpty ? Txt.SaveSlotEmpty : Txt.SavedGame)}
                onClick={() => o_.saves.save(i)}
            />)}
        </div>
    </MenuTemplate>
}