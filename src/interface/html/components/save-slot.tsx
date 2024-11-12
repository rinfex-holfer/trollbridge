import {FC} from "react";
import {o_} from "../../../managers/locator";

export const SaveSlot: FC<{
    index: number
    title: string
    timestamp?: string
    onSave?: () => void
    onLoad?: () => void
    onDelete?: () => void
}> = ({index, title, timestamp, onSave, onLoad, onDelete}) => {
    const action = onSave || onLoad;
    return <div className='save-file'>
        <div className="save-file__main-content" onClick={action}>
            <div className="save-file__index">{index + 1}</div>
            <div className="save-file__name">
                {title}
            </div>
            <div className="save-file__timestamp">{timestamp}</div>
        </div>
        {onDelete &&
            <button onClick={onDelete} className='button delete-icon'></button>}
    </div>
}