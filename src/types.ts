import {createResources} from "./managers/enemies";
import * as PIXI from 'pixi.js';

export const enum EntityKey {
    FOOD =  'FOOD'
}

export const enum Time {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
    NIGHT = 'night',
}

export const enum EnemyKey {
    FARMER = 'FARMER',
    MILITIA = 'MILITIA',
    SOLDIER = 'SOLDIER',
    KNIGHT = 'KNIGHT',
    ARISTORAT = 'ARISTORAT',
    PRINCE = 'PRINCE',
    KING = 'KING',
    TRADER = 'TRADER',
    CHILD = 'CHILD',
    FARMER_WOMEN = 'FARMER_WOMEN',
    PRINCESS = 'PRINCESS',
    DONKEY = 'DONKEY',
    TRADE_CART = 'TRADE_CART',
    CARRIAGE = 'CARRIAGE',
}

export const enum EncounterDanger {
    NONE = 'NONE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH',
    IMPOSSIBLE = 'IMPOSSIBLE',
}

export type EncounterTemplate = {
    level: number,
    enemies: EnemyKey[],
    stuff: EnemyKey[],
    nonCombatants: EnemyKey[],
}

export type Encounter = {
    level: number,
    enemies: Enemy[],
    stuff: Enemy[],
    nonCombatants: Enemy[],
}

export const enum Resource {
    GOLD = 'gold',
    FOOD = 'food',
    MATERIALS = 'materials',
}

export type Resources = {
    gold: number,
    food: number,
    materials: number,
}

export type Enemy = {
    key: EnemyKey,
    name: string,
    resourses: Resources
}