import React, {useEffect, useState} from "react";
import {timeManager} from "../managers/time-manager";
import {eventBus, Evt} from "../event-bus";
import {gameState} from "../game-state";
import {dangerKey} from "../managers/encounter";

export const PassingBy = () => {
    const [state, setState] = useState(gameState.passingBy);

    useEffect(() => {
        const sub = eventBus.on(Evt.ENCOUNTER_CHANGED, () => {
            setState(gameState.passingBy)
        })
        return () => {
            eventBus.unsubscribe(Evt.ENCOUNTER_CHANGED, sub);
        }
    }, [setState])

    return state ? <div id="passing-by">
        <div>По мосту проходят:</div>
        <ul>
            {state.enemies.map((enemy, i) => <li key={enemy.key+i}>{enemy.name}</li>)}
            {state.nonCombatants.map((enemy, i) => <li key={enemy.key+i}>{enemy.name}</li>)}
            {state.stuff.map((enemy, i) => <li key={enemy.key+i}>{enemy.name}</li>)}
        </ul>
        <div id="passing-by-danger">Опасность: {dangerKey()}</div>
    </div> : null;
}