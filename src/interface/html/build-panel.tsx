import {FC} from "react";
import {Vec} from "../../utils/utils-math";

export type BuildPanelProps = {
    isShown: boolean
    title?: string,
    description?: string,
    cost: number,
    coord: Vec,
    isEnoughMoney: boolean
}

export const defaultBuildPanelProps = {
    isShown: false,
    cost: 0,
    coord: {x: 0, y: 0},
    isEnoughMoney: false,
}

export const BuildPanel: FC<BuildPanelProps> = (
    {
        isShown,
        title,
        description,
        cost,
        coord,
        isEnoughMoney
    }
) => {
    if (!isShown) {
        return null
    }

    return <div className='build-panel'
                style={{
                    left: `${coord.x}px`,
                    top: `${coord.y}px`
                }}
    >
        {title && <div className='build-panel__title'>{title}</div>}
        {description && <div className='build-panel__description'>{description}</div>}
        <div className='build-panel__cost'>Cost: ${cost} gold</div>
    </div>
}