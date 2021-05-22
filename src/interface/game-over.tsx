import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";

export const GameOver = () => {
    const [state, setState] = useState('');

    useEffect(() => {
        const sub = eventBus.on(Evt.GAME_OVER, () => {
            setState(o_.game.gameoverCause)
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