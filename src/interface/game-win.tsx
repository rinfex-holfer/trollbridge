import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";

export const GameWin = () => {
    const [state, setState] = useState('');

    useEffect(() => {
        const sub = eventBus.on(Evt.GAME_WIN, (r) => setState(r))
        return () => eventBus.unsubscribe(Evt.GAME_WIN, sub)
    }, [setState])

    if (!state) return null

    return <div id="gamewin">
        <div className='title'>
            Победа!
        </div>
        <div className='reason'>
            {state}
        </div>
    </div>
}