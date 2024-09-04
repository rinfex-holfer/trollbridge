import {FC, PropsWithChildren} from "react";

export const MenuTemplate: FC<PropsWithChildren<{
    title: string
    isHorizontal?: boolean
}>> = ({title, isHorizontal, children}) => {
    let buttonsClass = 'menu-buttons'
    if (isHorizontal) buttonsClass += ' menu-buttons--horizontal'

    return <div className='menu-overlay'>
        <div className="title">
            {title}
        </div>
        <div className={buttonsClass}>
            {children}
        </div>
    </div>
}