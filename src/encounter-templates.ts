import {CharKey, EncounterTemplate} from "./types";

//  0   3
//  1   4
//  2   5

export const encounterTemplates: {[dangerLevel: number]: EncounterTemplate[]} = {
    0: [
        {
            text: 'Одинокий путник',
            enemies: [[1, CharKey.FARMER]],
        },
        {
            text: 'Группа фермеров',
            enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER]],
        },
    ],
    1: [
        {
            text: 'Группа фермеров',
            enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER]],
        },
    ],

    2: [
        {
            text: 'Группа фермеров',
            enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER], [4, CharKey.FARMER]],
        },
        {
            text: 'Патруль малый',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA]],
        },
        {
            text: 'Патруль',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA], [4, CharKey.ARCHER]],
        },
        {
            text: 'Пара солдат',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.SHIELDMAN]],
        },
        {
            text: 'Малый отряд солдат',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.SHIELDMAN], [4, CharKey.ARCHER]],
        },
    ],

    3: [
        {
            text: 'Толпа крестьян',
            enemies: [[0, CharKey.FARMER], [1, CharKey.FARMER], [2, CharKey.FARMER], [3, CharKey.FARMER], [4, CharKey.ARCHER], [5, CharKey.FARMER]],
        },
        {
            text: 'Патруль с лучником',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA], [2, CharKey.MILITIA], [4, CharKey.ARCHER]],
        },
        {
            text: 'Большой патруль',
            enemies: [[0, CharKey.FARMER], [1, CharKey.MILITIA], [2, CharKey.MILITIA], [3, CharKey.ARCHER], [4, CharKey.MILITIA], [5, CharKey.ARCHER]],
        },
        {
            text: 'Большой патруль',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.MILITIA], [2, CharKey.FARMER], [3, CharKey.ARCHER], [4, CharKey.ARCHER], [5, CharKey.ARCHER]],
        },
    ],
    4: [
        {
            text: 'Отряд солдат',
            enemies: [[0, CharKey.MILITIA], [1, CharKey.SHIELDMAN], [2, CharKey.MILITIA], [3, CharKey.ARCHER], [5, CharKey.ARCHER]],
        },
        {
            text: 'Большой отряд солдат',
            enemies: [[0, CharKey.SHIELDMAN], [1, CharKey.MILITIA], [2, CharKey.SHIELDMAN], [3, CharKey.ARCHER], [4, CharKey.MILITIA], [5, CharKey.ARCHER]],
        },
    ],

    5: [
        {
            text: 'Рыцарь',
            enemies: [[1, CharKey.KNIGHT]],
        },
        {
            text: 'Рыцарь с оруженосцем',
            enemies: [[1, CharKey.SHIELDMAN], [4, CharKey.KNIGHT]],
        },
        {
            text: 'Рыцарь с двумя оруженосцами',
            enemies: [[0, CharKey.SHIELDMAN], [2, CharKey.SHIELDMAN], [4, CharKey.KNIGHT]],
        },
    ],
    6: [
        {
            text: 'Рыцарь с отрядом',
            enemies: [[0, CharKey.SHIELDMAN], [1, CharKey.MILITIA], [2, CharKey.SHIELDMAN], [3, CharKey.KNIGHT], [4, CharKey.KNIGHT], [5, CharKey.ARCHER]],
        },
    ],
    7: [
        {
            text: 'Отряд Его Величества',
            enemies: [[0, CharKey.KNIGHT], [1, CharKey.SHIELDMAN], [2, CharKey.KNIGHT], [3, CharKey.ARCHER], [4, CharKey.KNIGHT], [5, CharKey.ARCHER]],
        },
    ]
}

export const maxEncounterLevel = Math.max(...Object.keys(encounterTemplates).map(k => +k))