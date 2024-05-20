import {FC, useEffect, useState} from "react";
import {eventBus, Evt} from "../../event-bus";


export const LoadingScreen: FC = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        eventBus.on(Evt.GAME_LOADING_STARTED, () => setIsVisible(true))
        eventBus.on(Evt.GAME_LOADING_PROGRESS, (val) => setProgress(Math.ceil(val)))
        eventBus.on(Evt.GAME_LOADING_FINISHED, () => setIsVisible(false))
    }, []);

    if (!isVisible) return null;

    return <div className='loading-screen'>
        loading... {progress}%
    </div>
}