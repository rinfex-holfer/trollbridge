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