import {EnemyKey} from "./enemies.js";

export const encounters = {
    0: [
        {
            level: 0,
            enemies: [],
            stuff: [EnemyKey.DONKEY],
            nonCombatants: [EnemyKey.FARMER_WOMEN, EnemyKey.CHILD],
        },

        {
            level: 0,
            enemies: [EnemyKey.FARMER],
            stuff: [EnemyKey.DONKEY],
            nonCombatants: [],
        },

        {
            level: 0,
            enemies: [EnemyKey.FARMER],
            stuff: [EnemyKey.DONKEY],
            nonCombatants: [EnemyKey.FARMER_WOMEN, EnemyKey.CHILD],
        },
    ],

    1: [
        {
            level: 1,
            enemies: [EnemyKey.FARMER, EnemyKey.FARMER],
            stuff: [],
            nonCombatants: [],
        },

        {
            level: 1,
            enemies: [EnemyKey.FARMER, EnemyKey.FARMER, EnemyKey.FARMER],
            stuff: [],
            nonCombatants: [],
        },
    ],

    2: [
        {
            level: 2,
            enemies: [EnemyKey.SOLDIER],
            nonCombatants: [EnemyKey.TRADER],
            stuff: [EnemyKey.DONKEY],
        },

        {
            level: 2,
            enemies: [EnemyKey.MILITIA, EnemyKey.MILITIA, EnemyKey.MILITIA],
            stuff: [],
            nonCombatants: [],
        },
    ],
    3: [
        {
            level: 3,
            enemies: [EnemyKey.SOLDIER, EnemyKey.SOLDIER, EnemyKey.SOLDIER],
            nonCombatants: [EnemyKey.TRADER],
            stuff: [EnemyKey.TRADE_CART],
        },

        {
            level: 3,
            enemies: [EnemyKey.MILITIA, EnemyKey.MILITIA, EnemyKey.MILITIA, EnemyKey.MILITIA, EnemyKey.MILITIA],
            stuff: [],
            nonCombatants: [],
        },
    ],
}

export const encounterDanger = {
    NONE: 'NONE',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    VERY_HIGH: 'VERY_HIGH',
    IMPOSSIBLE: 'IMPOSSIBLE',
}