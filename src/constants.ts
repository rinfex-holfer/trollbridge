import {MeatState, MiscFood, Time} from "./types";

export const TimeOrder = [Time.MORNING, Time.AFTERNOON, Time.EVENING, Time.NIGHT];

export const gameConstants = {
    //  ======================== TROLL ========================
    MAX_HUNGER: 10,
    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 1,
    HP_FROM_SLEEP: 2,
    MAX_TROLL_HP: {
        1: 100,
        2: 13,
        3: 16,
        4: 20,
        5: 25,
    } as {[key: number]: number},
    TROLL_ARMOR: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
    } as {[key: number]: number},
    TROLL_DMG: {
        1: 10,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
    } as {[key: number]: number},
    TROLL_SPEED: 500,

    //  ======================== CHARS ========================
    CHAR_SPEED: 100,
    CHAR_FAST: 150,
    CHAR_VERY_FAST: 250,

    //  ======================== FOOD ========================
    RAW_MEAT_TIME_LIMIT: 6,
    STALE_MEAT_TIME_LIMIT: 6,

    FOOD_FOR_DISH: 3,

    HP_FROM: {
        [MiscFood.DISH]: 6,
        [MeatState.RAW]: 2,
        [MeatState.STALE]: 0,
    },
    HUNGER_REDUCTION_FROM: {
        [MiscFood.DISH]: 10,
        [MeatState.RAW]: 3,
        [MeatState.STALE]: 2,
    },

    //  ======================== GOLD ========================
    MAX_GOLD_IN_SPRITE: 100,
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
}

export const colorsCSS = {
    GREEN: 'rgb(0, 256, 0)',
    RED: 'rgb(256, 0, 0)',
    BLUE: 'rgb(0, 0, 256)',
    PURPLE: 'rgb(138,43,226)',
    WHITE: 'rgb(256, 256, 256)',
    BLACK: 'rgb(0, 0, 0)',
    YELLOW: 'rgb(255, 255, 0)'
}

export const colorsNum = {
    GREEN: 0x00AA00,
    RED: 0xFF0000,
    BLUE: 0x0000FF,
    PURPLE: 0x080008,
    WHITE: 0xFFFFFF,
    BLACK: 0x000000,
}