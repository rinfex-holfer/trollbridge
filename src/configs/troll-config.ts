import {CharKey, LevelReqs, TrollAbility} from "../types";

export const trollConfig = {
    TROLL_MAX_HUNGER: 10,
    TROLL_MAX_SELF_CONTROL: 100,

    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 0.05,
    HP_FROM_SLEEP: 0.2,
    SELF_CONTROL_FROM_SLEEP: 1,

    TROLL_SPEED: 500,

    TROLL_LEVELING: {
        1: {
            maxHp: 10,
            block: 0,
            dmg: [3, 6],
            xp: 20,
            xpRewards: {
                [CharKey.FARMER]: 1,
                [CharKey.MILITIA]: 5,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
            },
            newAbilities: [TrollAbility.MAN_EATER],
        },
        2: {
            maxHp: 20,
            block: 0,
            dmg: [5, 10],
            xp: 50,
            xpRewards: {
                [CharKey.FARMER]: 1,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
            },
            newAbilities: [TrollAbility.THROW_ROCK],
        },
        3: {
            maxHp: 40,
            block: 0,
            dmg: [10, 20],
            xp: 100,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
            },
            newAbilities: [TrollAbility.GRAPPLE],
        },
        4: {
            maxHp: 60,
            block: 0,
            dmg: [15, 50],
            xp: 300,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
            },
            newAbilities: [],
        },
        5: {
            maxHp: 50,
            block: 0,
            dmg: [20, 40],
            xp: -1,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 0,
                [CharKey.ARCHER]: 0,
                [CharKey.SHIELDMAN]: 0,
                [CharKey.KNIGHT]: 0,
            },
            newAbilities: [],
        },
    } as {[key: number]: LevelReqs},
}