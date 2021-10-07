import {CharKey, EncounterTemplate} from "./types";

//  0   3
//  1   4
//  2   5

export const encounterTemplates: {[dangerLevel: number]: EncounterTemplate[]} = {
    0: [
        // {
        //     text: 'Одинокий путник',
        //     level: 0,
        //     enemies: [[1, CharKey.FARMER]],
        // },
        // {
        //     text: 'Группа фермеров',
        //     level: 0,
        //     enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER]],
        // },
        {
            text: 'Группа фермеров',
            level: 1,
            enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER]],
        },
        // {
        //     text: 'Группа фермеров',
        //     level: 1,
        //     enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER], [4, CharKey.FARMER]],
        // },
        // {
        //     text: 'Толпа крестьян',
        //     level: 1,
        //     enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER], [3, CharKey.FARMER], [4, CharKey.FARMER], [5, CharKey.FARMER]],
        // },
        {
            text: 'Патрульные ополченцы',
            level: 1,
            enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA], [4, CharKey.ARCHER]],
        },
        // {
        //     text: 'Отряд ополчения',
        //     level: 2,
        //     enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA], [2, CharKey.MILITIA], [3, CharKey.ARCHER], [4, CharKey.MILITIA], [5, CharKey.ARCHER]],
        // },
        // {
        //     text: 'Солдат',
        //     level: 2,
        //     enemies: [[1, CharKey.SHIELDMAN]],
        // },
        {
            text: 'Отряд солдат',
            level: 2,
            enemies: [[0, CharKey.SHIELDMAN], [1, CharKey.MILITIA], [2, CharKey.SHIELDMAN], [4, CharKey.ARCHER]],
        },
        // {
        //     text: 'Отряд солдат',
        //     level: 2,
        //     enemies: [[0, CharKey.MILITIA], [1, CharKey.SHIELDMAN], [2, CharKey.MILITIA], [4, CharKey.ARCHER]],
        // },
        // {
        //     text: 'Рыцарь с оруженосцем',
        //     level: 3,
        //     enemies: [[0, CharKey.SHIELDMAN], [1, CharKey.KNIGHT]],
        // },
        // {
        //     text: 'Отряд Его Величества',
        //     level: 4,
        //     enemies: [[0, CharKey.SHIELDMAN], [1, CharKey.KNIGHT], [2, CharKey.SHIELDMAN], [3, CharKey.ARCHER], [4, CharKey.MILITIA], [5, CharKey.ARCHER]],
        // },
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