import {FC, PropsWithChildren} from "react";

export const MenuTemplate: FC<PropsWithChildren<{
    title: string
}>> = ({title, children}) => {
    return <div className='menu-overlay'>
        <div className="title">
            {title}
        </div>
        {children}
    </div>
}