import {FC} from "react";


export const SaveFile: FC<{
    index: string
    filename: string,
    timestamp: string
}> = ({index, filename, timestamp}) => {
    return <div className='save-file'>
        <div className="save-file__index">{index}.</div>
        <div className="save-file__name">{filename}</div>
        <div className="save-file__timestamp">{timestamp}</div>
    </div>
}