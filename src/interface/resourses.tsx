import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";

export const Resources = () => {
    const [state, setState] = useState({...o_.lair.resources})

    useEffect(() => {
        const sub = eventBus.on(
            Evt.RESOURSES_CHANGED,
            () => {
                setState({...o_.lair.resources});
            }
        );
        return () => {
            eventBus.unsubscribe(Evt.RESOURSES_CHANGED, sub);
        }
    }, [setState])

    return <>
        <h2>Ресурсы</h2>
        <ul>
            {/*<li id="food">Еда: {state.food}</li>*/}
            <li id="materials">Материалы: {state.materials}</li>
            <li id="gold">Золото: {state.gold}</li>
        </ul>
    </>
}