import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../../event-bus";
import {o_} from "../../managers/locator";

export const GameOver = () => {
    const [state, setState] = useState('');

    useEffect(() => {
        const sub = eventBus.on(Evt.GAME_OVER, () => setState(o_.game.gameOverReason))
        return () => eventBus.unsubscribe(Evt.GAME_OVER, sub)
    }, [setState])

    if (!state) return null

    return <div id="gameover">
        <div className='title'>
            GAME OVER
        </div>
        <div className='reason'>
            {state}
        </div>
    </div>
}