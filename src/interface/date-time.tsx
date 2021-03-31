import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {gameState} from "../game-state";

export const DateTime = () => {
    const [date, setDate] = useState({day: gameState.day, time: gameState.time});
    useEffect(() => {
        const sub = eventBus.on(Evt.TIME_PASSED, () => {
            setDate({
                day: gameState.day,
                time: gameState.time,
            })
        })
        return () => {
            eventBus.unsubscribe(Evt.TIME_PASSED, sub);
        }
    }, [setDate])

    return <h1 id="time">день {date.day}, {date.time}</h1>
}