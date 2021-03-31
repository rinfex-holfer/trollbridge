import React, {useEffect, useState} from "react";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";

export const Resources = () => {
    const [state, setState] = useState({
        gold: gameState.gold,
        materials: gameState.materials,
        food: gameState.food,
    })

    useEffect(() => {
        const sub = eventBus.on(
            Evt.RESOURSES_CHANGED,
            () => {
                setState({
                    gold: gameState.gold,
                    materials: gameState.materials,
                    food: gameState.food,
                });
            }
        );
        return () => {
            eventBus.unsubscribe(Evt.RESOURSES_CHANGED, sub);
        }
    }, [setState])

    return <>
        <h2>Ресурсы</h2>
        <ul>
            <li id="food">Еда: {state.food}</li>
            <li id="materials">Материалы: {state.materials}</li>
            <li id="gold">Золото: {state.gold}</li>
        </ul>
    </>
}