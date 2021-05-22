

import React, {useEffect, useState} from "react";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";

export const Troll = () => {
    const [stats, setStats] = useState({
        level: o_.troll.level,
        hp: o_.troll.hp,
        hunger: o_.troll.hunger,
    });

    useEffect(() => {
        const sub = eventBus.on(Evt.TROLL_STATS_CHANGED, () => {
            setStats({
                level: o_.troll.level,
                hp: o_.troll.hp,
                hunger: o_.troll.hunger,
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