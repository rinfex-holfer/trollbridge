import React, {useEffect, useRef, useState} from "react";
import {timeManager} from "../managers/time-manager";
import {eventBus, Evt} from "../event-bus";
import {createNegotiation} from "../managers/negotiations";
import {gameState} from "../game-state";

export const Negotiations = () => {
    const negotiationRef = useRef<any>();
    const [options, setOptions] = useState<string[] | null>(null)

    useEffect(() => {
        const sub = eventBus.on(Evt.TROLL_LOCATION_CHANGED, () => {
            if (gameState.troll.location === 'bridge' && gameState.passingBy) {
                negotiationRef.current = createNegotiation();
                setOptions(negotiationRef.current.getMessages());
            }
        })

        return () => {
            eventBus.unsubscribe(Evt.TROLL_LOCATION_CHANGED, sub);
        }
    }, [])

    return <>
        {options && options.map((option: string) => {
            return <button
                key={option}
                type='button'
                onClick={() => {
                    negotiationRef.current.onMessage(option);
                    setOptions(negotiationRef.current.getMessages());
                }}
            >
                {option}
            </button>;
        })}
        {gameState.encounterText}
    </>
}