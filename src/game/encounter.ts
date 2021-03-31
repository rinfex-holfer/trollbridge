import {Encounter, EncounterDanger, EncounterTemplate, EnemyKey} from "../types";
import {getRndItem, rndBetween} from "../utils-math";
import {gameState} from "../game-state";
import {createEnemy} from "./enemies";
import {eventBus, Evt} from "../event-bus";
import {trollManager} from "./troll";

eventBus.on(Evt.BYPASSED, clearEncounter)
eventBus.on(Evt.TIME_PASSED, createRandomEncounter);

export function clearEncounter() {
    gameState.passingBy = null;
    eventBus.emit(Evt.ENCOUNTER_CHANGED);

    trollManager.goToLair();
}

export function createRandomEncounter() {
    const rnd = rndBetween(Math.max(0, gameState.troll.level - 1), gameState.troll.level + 1);
    const encounter = getRndItem(encounters[rnd]);
    const item: Encounter = {
        level: encounter.level,
        enemies: encounter.enemies.map(createEnemy),
        stuff: encounter.stuff.map(createEnemy),
        nonCombatants: encounter.nonCombatants.map(createEnemy),
    };

    gameState.passingBy = item;

    eventBus.emit(Evt.ENCOUNTER_CHANGED);
}

const encounters: {[dangerLevel: number]: EncounterTemplate[]} = {
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

function getDangerLevel() {
    if (!gameState.passingBy) throw Error('nobody passing by!');

    return gameState.troll.level - gameState.passingBy.level;
}

export function dangerKey() {
    if (!gameState.passingBy) throw Error('nobody passing by!');

    if (gameState.passingBy.level === 0) return EncounterDanger.NONE

    const diff = getDangerLevel();
    if (diff > 1) return EncounterDanger.LOW;
    else if (diff === 1) return EncounterDanger.LOW;
    else if (diff === 0) return EncounterDanger.MEDIUM;
    else if (diff === -1) return EncounterDanger.HIGH;
    else if (diff === -2) return EncounterDanger.VERY_HIGH;
    else return EncounterDanger.IMPOSSIBLE;
}