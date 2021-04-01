import {constants} from "./constants";
import {Encounter, Time} from "./types";

export const gameState = {
    day: 1,
    time: Time.MORNING,
    gameover: '',

    troll: {
        level: 1,
        hp: constants.MAX_HP[1],
        hunger: 0,
        location: 'lair' as 'lair' | 'bridge',
    },

    food: 3,
    gold: 0,
    materials: 0,

    passingBy: null as (null | Encounter),

    encounterText: '',
}