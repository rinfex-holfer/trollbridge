import {FC, PropsWithChildren} from "react";

export const MenuTemplate: FC<PropsWithChildren<{
    title: string
    subtitle?: string
    isHorizontal?: boolean
}>> = ({title, subtitle, isHorizontal, children}) => {
    let buttonsClass = 'menu-buttons'
    if (isHorizontal) buttonsClass += ' menu-buttons--horizontal'

    return <div className='menu-overlay'>
        <div className="title">
            {title}
        </div>
        {subtitle && <div className="menu-subtitle">
            {subtitle}
        </div>}
        <div className={buttonsClass}>
            {children}
        </div>
    </div>
}