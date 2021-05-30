import {FoodType, LevelReqs, Time} from "./types";

export const TimeOrder = [Time.MORNING, Time.AFTERNOON, Time.EVENING, Time.NIGHT];

export const gameConstants = {
    //  ======================== TROLL ========================
    TROLL_MAX_HUNGER: 10,
    TROLL_MAX_SELF_CONTROL: 100,

    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 1,
    HP_FROM_SLEEP: 2,

    TROLL_LEVELING: {
        1: {
            maxHp: 7,
            armor: 0,
            dmg: 1,
            xp: 10,
        },
        2: {
            maxHp: 10,
            armor: 1,
            dmg: 1,
            xp: 20,
        },
        3: {
            maxHp: 12,
            armor: 2,
            dmg: 2,
            xp: 30,
        },
        4: {
            maxHp: 15,
            armor: 2,
            dmg: 2,
            xp: 40,
        },
        5: {
            maxHp: 20,
            armor: 3,
            dmg: 3,
            xp: 50,
        },
    } as {[key: number]: LevelReqs},

    TROLL_SPEED: 500,

    //  ======================== CHARS ========================
    CHAR_SPEED: 100,
    CHAR_FAST: 150,
    CHAR_VERY_FAST: 250,

    //  ======================== FOOD ========================
    RAW_MEAT_TIME_LIMIT: 6,
    STALE_MEAT_TIME_LIMIT: 6,

    FOOD_FOR_DISH: 3,

    HP_FROM_FOOD: {
        [FoodType.DISH]: 6,
        [FoodType.NORMAL]: 2,
    },
    HP_FROM_STALE_FOOD: {
        [FoodType.DISH]: 3,
        [FoodType.NORMAL]: 1,
    },
    HUNGER_REDUCTION_FROM_FOOD: {
        [FoodType.DISH]: 10,
        [FoodType.NORMAL]: 3,
    },
    HUNGER_REDUCTION_FROM_STALE_FOOD: {
        [FoodType.DISH]: 6,
        [FoodType.NORMAL]: 2,
    },

    //  ======================== GOLD ========================
    MAX_GOLD_IN_SPRITE: 100,
    FOOD_FROM_CHARACTER: 4,
    FOOD_FROM_DEVOURED_CHARACTER: 3,
}

export const zLayers = {
    PARTICLES: 1050,
    GAME_OBJECTS_MIN: 100,
    LAIR_OBJECTS: 200,
    CHAR_MENU: 1300,
    DIALOG_OPTIONS: 1400,
}

export const colors = {
    GREEN: '0x00AA00',
    RED: '0xFF0000',
    BLUE: '0x0000FF',
    PURPLE: '0x080008',
    WHITE: '0xFFFFFF',
    BLACK: '0x000000',
    ORANGE: '0xFFA500',
}

export const colorsCSS = {
    GREEN: 'rgb(0, 256, 0)',
    RED: 'rgb(256, 0, 0)',
    BLUE: 'rgb(0, 0, 256)',
    PURPLE: 'rgb(138,43,226)',
    WHITE: 'rgb(256, 256, 256)',
    BLACK: 'rgb(0, 0, 0)',
    YELLOW: 'rgb(255, 255, 0)',
    ORANGE: 'rgb(255, 165, 0)',
}

export const colorsNum = {
    GREEN: 0x00AA00,
    ROTTEN: 0xAAFFAA,
    RED: 0xFF0000,
    BLUE: 0x0000FF,
    PURPLE: 0x080008,
    WHITE: 0xFFFFFF,
    BLACK: 0x000000,
    YELLOW: 0xFFFF00,
    ORANGE: 0xFFA500,
}