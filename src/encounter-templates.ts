import {CharKey, EncounterTemplate} from "./types";

export const encounterTemplates: {[dangerLevel: number]: EncounterTemplate[]} = {
    0: [
        {
            text: 'Одинокий путник',
            level: 0,
            enemies: [CharKey.FARMER],
        },
        {
            text: 'Группа фермеров',
            level: 1,
            enemies: [CharKey.FARMER, CharKey.FARMER, CharKey.FARMER],
        },
        {
            text: 'Толпа крестьян',
            level: 1,
            enemies: [CharKey.FARMER, CharKey.FARMER, CharKey.FARMER, CharKey.FARMER, CharKey.FARMER],
        },
        {
            text: 'Патрульные ополченцы',
            level: 1,
            enemies: [CharKey.MILITIA, CharKey.MILITIA],
        },
        {
            text: 'Отряд ополчения',
            level: 2,
            enemies: [CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA],
        },
        {
            text: 'Отряд солдат',
            level: 2,
            enemies: [CharKey.SOLDIER, CharKey.SOLDIER, CharKey.SOLDIER],
        },
        {
            text: 'Рыцарь с оруженосцем',
            level: 3,
            enemies: [CharKey.SOLDIER, CharKey.KNIGHT],
        },
        {
            text: 'Отряд Его Величества',
            level: 4,
            enemies: [CharKey.SOLDIER, CharKey.KNIGHT, CharKey.SOLDIER, CharKey.KNIGHT, CharKey.SOLDIER],
        },
        // {
        //     level: 0,
        //     enemies: [CharKey.FARMER_WOMEN, CharKey.CHILD],
        // },
        // {
        //     level: 0,
        //     enemies: [CharKey.DONKEY, CharKey.FARMER_WOMEN, CharKey.CHILD],
        // },
        //
        //
        // {
        //     level: 0,
        //     enemies: [CharKey.FARMER],
        //     stuff: [CharKey.DONKEY],
        //     nonCombatants: [CharKey.FARMER_WOMEN, CharKey.CHILD],
        // },
    ],
    //
    // 1: [
    //     {
    //         level: 1,
    //         enemies: [CharKey.FARMER, CharKey.FARMER],
    //         stuff: [],
    //         nonCombatants: [],
    //     },
    //
    //     {
    //         level: 1,
    //         enemies: [CharKey.FARMER, CharKey.FARMER, CharKey.FARMER],
    //         stuff: [],
    //         nonCombatants: [],
    //     },
    // ],
    //
    // 2: [
    //     {
    //         level: 2,
    //         enemies: [CharKey.SOLDIER],
    //         nonCombatants: [CharKey.TRADER],
    //         stuff: [CharKey.DONKEY],
    //     },
    //
    //     {
    //         level: 2,
    //         enemies: [CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA],
    //         stuff: [],
    //         nonCombatants: [],
    //     },
    // ],
    // 3: [
    //     {
    //         level: 3,
    //         enemies: [CharKey.SOLDIER, CharKey.SOLDIER, CharKey.SOLDIER],
    //         nonCombatants: [CharKey.TRADER],
    //         stuff: [CharKey.TRADE_CART],
    //     },
    //
    //     {
    //         level: 3,
    //         enemies: [CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA, CharKey.MILITIA],
    //         stuff: [],
    //         nonCombatants: [],
    //     },
    // ],
}