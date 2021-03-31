

import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {gameState} from "../game-state";
import {trollManager} from "../game/troll";

export const Troll = () => {
    const [stats, setStats] = useState({
        level: gameState.troll.level,
        hp: gameState.troll.hp,
        hunger: gameState.troll.hunger,
        location: gameState.troll.location,
    });

    useEffect(() => {
        const sub = eventBus.on(Evt.TROLL_STATS_CHANGED, () => {
            setStats({
                level: gameState.troll.level,
                hp: gameState.troll.hp,
                hunger: gameState.troll.hunger,
                location: gameState.troll.location,
            })
        })

        const sub2 = eventBus.on(Evt.TROLL_LOCATION_CHANGED, () => {
            setStats({
                level: gameState.troll.level,
                hp: gameState.troll.hp,
                hunger: gameState.troll.hunger,
                location: gameState.troll.location,
            })
        })

        return () => {
            eventBus.unsubscribe(Evt.TROLL_STATS_CHANGED, sub);
            eventBus.unsubscribe(Evt.TROLL_LOCATION_CHANGED, sub2);
        }
    }, [setStats])

    return <>
        <h2>Тролль</h2>
        <ul>
            <li>Уровень: {stats.level}</li>
            <li>HP: {stats.hp}</li>
            <li>Голод: {stats.hunger}</li>
            <li>Находится: {stats.location}</li>
        </ul>

        {
            gameState.troll.location === 'bridge'
            ? <button type='button' onClick={trollManager.goToLair}>В логово</button>
            : <button type='button' onClick={trollManager.goToBridge}>На мост</button>
        }
    </>
}