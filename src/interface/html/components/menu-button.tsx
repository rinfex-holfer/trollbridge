import {FC} from "react";

export const MenuButton: FC<{
    onClick: VoidFunction,
    label: string,
}> = ({onClick, label}) => {
    return <button className='menu-button' type='button' onClick={onClick}>
        {label}
    </button>
}