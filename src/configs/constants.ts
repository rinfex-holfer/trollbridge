import {FoodType, LevelReqs, Time} from "../types";

export const TimeOrder = [Time.MORNING, Time.AFTERNOON, Time.EVENING, Time.NIGHT];

export const gameConstants = {
    //  ======================== CHARS ========================
    CHAR_SPEED: 100,
    CHAR_FAST: 150,
    CHAR_VERY_FAST: 250,

    horse: {
        speed: 500,
    }
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