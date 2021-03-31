import React, {useEffect, useState} from "react";
import {timeManager} from "../game/time";
import {eventBus, Evt} from "../event-bus";
import {gameState} from "../game-state";

export const GameOver = () => {
    const [state, setState] = useState('');

    useEffect(() => {
        const sub = eventBus.on(Evt.GAME_OVER, () => {
            setState(gameState.gameover)
        })
        return () => {
            eventBus.unsubscribe(Evt.GAME_OVER, sub);
        }
    }, [setState])

    return state ? <div id="gameover">
        <div id="gameover-reason">
            {state}
        </div>
        <div>=============================</div>
        <div>========= GAME OVER =========</div>
        <div>=============================</div>
    </div> : null;
}