export const enum FoodType {
    MEAT = 'MEAT',
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
    EARLY_MORNING = 'early_morning',
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    LATE_AFTERNOON = 'late_afternoon',
    EVENING = 'evening',
    MIDNIGHT = 'midnight',
    NIGHT = 'night',
}

export const enum CharKey {
    FARMER = 'peasant',
    MILITIA = 'militia',
    ARCHER = 'archer',
    SHIELDMAN = 'shieldman',
    KNIGHT = 'knight',
    VIGILANTE = 'vigilante',
    KING = 'king',
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

/**
 *  0   3
 *  1   4
 *  2   5
 */
export type SquadPlace = 0 | 1 | 2 | 3 | 4 | 5

export type EncounterTemplate = {
    enemies: [SquadPlace, CharKey][],
    speakerIdx?: number,
    text: string,
    greetText?: string
    type?: SQUAD_TYPE
}


export enum SQUAD_TYPE {
    VIGILANTE = 'VIGILANTE',
    KING = 'KING'
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
    maxHunger: number,
    block: number,
    dmg: [number, number],
    xp: number,
    xpRewards: {
        [CharKey.FARMER]: number,
        [CharKey.MILITIA]: number,
        [CharKey.ARCHER]: number,
        [CharKey.SHIELDMAN]: number,
        [CharKey.KNIGHT]: number,
        [CharKey.VIGILANTE]: number,
        [CharKey.KING]: number,
    },
    newAbilities: TrollAbility[]
}

export enum TrollAbility {
    THROW_ROCK,
    GRAPPLE,
    MAN_EATER
}

export const enum NegotiationsMessage {
    ON_START = 'ON_START',
    DEMAND_ALL = 'Потребовать все',
    DEMAND_PAY = 'Потребовать плату',
    GO_IN_PEACE = 'Отпустить',
    TO_BATTLE = 'Атаковать',
}