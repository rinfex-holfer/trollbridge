import {Time} from "./types";

export const TimeOrder = [Time.MORNING, Time.AFTERNOON, Time.EVENING, Time.NIGHT];

export const constants = {
    MAX_HUNGER: 10,
    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 1,
    MAX_HP: {
        1: 10,
        2: 13,
        3: 16,
        4: 20,
        5: 25,
    } as {[key: number]: number},
}

export const zLayers = {
    PARTICLES: 50,
    GAME_OBJECTS_MIN: 100,
    LAIR_OBJECTS: 200,
    CHAR_MENU: 300,
}

export const colors = {
    GREEN: '0x00AA00',
    RED: '0xFF0000',
    BLUE: '0x0000FF',
    PURPLE: '0x080008',
}