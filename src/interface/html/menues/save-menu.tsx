import {FC} from "react";
import {SaveFile} from "../components/save-file";
import {MenuTemplate} from "../components/menu-template";
import {o_} from "../../../managers/locator";
import {Txt} from "../../../managers/core/texts";

export const SaveMenu: FC = () => {
    return <MenuTemplate title={o_.texts.t(Txt.SaveMenu)}>
        <div></div>
        <div className='save-menu'>
            <SaveFile index={'1'} filename={'save a'} timestamp={'12312312'}/>
            <SaveFile index={'1'} filename={'save a'} timestamp={'12312312'}/>
            <SaveFile index={'1'} filename={'save a'} timestamp={'12312312'}/>
            <SaveFile index={'1'} filename={'save a'} timestamp={'12312312'}/>
        </div>
    </MenuTemplate>
}