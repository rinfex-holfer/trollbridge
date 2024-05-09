import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../../event-bus";
import {o_} from "../../managers/locator";

export const DateTime = () => {
    const [date, setDate] = useState({day: o_.time.day, time: o_.time.time});
    useEffect(() => {
        const sub = eventBus.on(Evt.TIME_PASSED, () => {
            setDate({
                day: o_.time.day,
                time: o_.time.time,
            })
        })
        return () => {
            eventBus.unsubscribe(Evt.TIME_PASSED, sub);
        }
    }, [setDate])

    return <h1 id="time">день {date.day}, {date.time}</h1>
}