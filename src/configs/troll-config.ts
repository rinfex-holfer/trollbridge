import {LevelReqs} from "../types";

export const trollConfig = {
    TROLL_MAX_HUNGER: 10,
    TROLL_MAX_SELF_CONTROL: 100,

    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 1,
    HP_FROM_SLEEP: 2,

    TROLL_SPEED: 500,

    TROLL_LEVELING: {
        1: {
            maxHp: 10,
            armor: 1,
            dmg: 6,
            xp: 10,
        },
        2: {
            maxHp: 12,
            armor: 3,
            dmg: 9,
            xp: 20,
        },
        3: {
            maxHp: 15,
            armor: 4,
            dmg: 12,
            xp: 30,
        },
        4: {
            maxHp: 20,
            armor: 5,
            dmg: 15,
            xp: 40,
        },
    } as {[key: number]: LevelReqs},
}