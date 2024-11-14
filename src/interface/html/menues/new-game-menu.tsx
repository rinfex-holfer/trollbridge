import {FC} from "react";
import {MenuTemplate} from "../components/menu-template";
import {MenuButton} from "../components/menu-button";
import {o_} from "../../../managers/locator";

import {Txt} from "../../../translations";
import {useTranslation} from "react-i18next";


export const NewGameMenu: FC = () => {
    const {t, i18n} = useTranslation();

    return <MenuTemplate title={t('Are you sure? All progress will be lost')}>
        <MenuButton
            label={o_.texts.t(Txt.NewGame)}
            onClick={() => {
                console.log("onclick")
                o_.menu.closeAllMenues()
                o_.saves.cleanupSavesStorage()
                o_.lair.reset()
            }}/>
        <MenuButton
            onClick={() => o_.menu.closeMenu()}
            label={o_.texts.t(Txt.Cancel)}
        />
    </MenuTemplate>
}