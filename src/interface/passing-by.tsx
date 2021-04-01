import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {charManager} from "../managers/char-manager";

export const PassingBy = () => {
    const [state, setState] = useState([] as any[]);

    useEffect(() => {
        const sub = eventBus.on(Evt.ENCOUNTER_CHANGED, () => {
            setState(charManager.travellers)
        })
        return () => {
            eventBus.unsubscribe(Evt.ENCOUNTER_CHANGED, sub);
        }
    }, [setState])

    return state.length ? <div id="passing-by">
        <div>По мосту проходят:</div>
        <ul>
            {state.map((enemy, i) => <li key={enemy.key+i}>{enemy.key}</li>)}
        </ul>
        <div id="passing-by-danger">Опасность: {charManager.getDangerKey()}</div>
    </div> : null;
}