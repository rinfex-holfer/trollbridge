
export const enum MiscFood {
    DISH = 'DISH'
}

export const enum FoodType {
    NORMAL = 'NORMAL',
    DISH = 'DISH',
}

export type Experience = {
    food: number,
    gold: number,
    enemies: number
}

export const enum TrollLocation {
    BRIDGE = 'BRIDGE',
    LAIR = 'LAIR',
}

export const enum Time {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
    NIGHT = 'night',
}

export const enum CharKey {
    FARMER = 'peasant',
    MILITIA = 'militia',
    SOLDIER = 'soldier',
    KNIGHT = 'knight',
    // ARISTOCRAT = 'aristorat',
    // PRINCE = 'prince',
    // KING = 'king',
    // TRADER = 'trader',
    // CHILD = 'child',
    // FARMER_WOMEN = 'farmer_women',
    // PRINCESS = 'princess',
    // DONKEY = 'donkey',
    // TRADE_CART = 'trade_cart',
    // CARRIAGE = 'carriage',
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
    enemies: CharKey[],
    text: string
}

export type Encounter = {
    level: number,
    enemies: Enemy[],
    stuff: Enemy[],
    nonCombatants: Enemy[],
}

export const enum ResourceKey {
    GOLD = 'gold',
    FOOD = 'food',
}

export type Resources = {
    [ResourceKey.FOOD]: number,
    [ResourceKey.GOLD]: number,
}

export type Enemy = {
    id: string,
    key: CharKey,
    resourses: Resources,
    hp: number,
    isCombatant: boolean,
    isUnconscious: boolean,
    isAlive: boolean,
    isPrisoner: boolean,
}

export type LevelReqs = {
    maxHp: number,
    armor: number,
    dmg: number,
    xp: number,
}