

import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {gameState} from "../game-state";
import {trollManager} from "../managers/troll-manager";

export const Troll = () => {
    const [stats, setStats] = useState({
        level: gameState.troll.level,
        hp: gameState.troll.hp,
        hunger: gameState.troll.hunger,
    });

    useEffect(() => {
        const sub = eventBus.on(Evt.TROLL_STATS_CHANGED, () => {
            setStats({
                level: gameState.troll.level,
                hp: trollManager.hp,
                hunger: gameState.troll.hunger,
            })
        })

        return () => {
            eventBus.unsubscribe(Evt.TROLL_STATS_CHANGED, sub);
        }
    }, [setStats])

    return <>
        <h2>Тролль</h2>
        <ul>
            <li>Уровень: {stats.level}</li>
            <li>HP: {stats.hp}</li>
            <li>Голод: {stats.hunger}</li>
        </ul>
    </>
}