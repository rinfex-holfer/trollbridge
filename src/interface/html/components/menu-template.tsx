import {FC, PropsWithChildren} from "react";
import {o_} from "../../../managers/locator";
import {Txt} from "../../../translations";

export const MenuTemplate: FC<PropsWithChildren<{
    title: string
    subtitle?: string
    isHorizontal?: boolean
    withBackButton?: boolean
}>> = ({title, subtitle, isHorizontal, withBackButton, children}) => {
    let buttonsClass = 'menu-buttons'
    if (isHorizontal) buttonsClass += ' menu-buttons--horizontal'

    return <div className='menu-overlay'>
        <div className="title">
            {title}
        </div>
        {subtitle && <div className="menu-subtitle">
            {subtitle}
        </div>}
        {withBackButton &&
            <div className="menu-button menu-button--short"
                 onClick={() => o_.menu.closeMenu()}>{o_.texts.t(Txt.Back)}</div>}
        <div className={buttonsClass}>
            {children}
        </div>
    </div>
}