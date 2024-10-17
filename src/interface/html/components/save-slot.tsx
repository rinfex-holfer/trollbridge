import {FC} from "react";

export const SaveSlot: FC<{
    index: number
    title: string
    timestamp?: string
    onClick: () => void
}> = ({index, title, timestamp, onClick}) => {
    return <div className='save-file' onClick={onClick}>
        <div className="save-file__index">{index}</div>
        <div className="save-file__name">
            {title}
        </div>
        <div className="save-file__timestamp">{timestamp}</div>
    </div>
}