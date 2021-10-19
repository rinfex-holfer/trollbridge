import {CharKey, LevelReqs, TrollAbility} from "../types";
import {TrollFearLevel} from "../managers/game/troll/types";

export const trollConfig = {
    TROLL_MAX_HUNGER: 10,
    TROLL_MAX_SELF_CONTROL: 100,

    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 0.05,
    HP_FROM_SLEEP: 0.1,
    HP_FROM_SLEEP_ON_BED: 0.25,
    SELF_CONTROL_FROM_SLEEP: 1,

    TROLL_MAX_FEAR: 100,
    FEAR_CHANGES: {
        DEVOUR: 5,
        VICTORY: 2,
        ALL_GIVEN: 3,
        DEFEAT: -4,
        LET_PASS_AFTER_ASKING: -2,
        ASK_PAY_AFTER_ALL_REFUSED: -1,
        DAY_PASSED: -1,
    },

    FEAR_LEVELS: [
        [-100, TrollFearLevel.HARMLESS],
        [-66, TrollFearLevel.NOT_SERIOUS],
        [-33, TrollFearLevel.UNPREDICTABLE],
        [33, TrollFearLevel.DANGEROUS],
        [66, TrollFearLevel.HORRIFIC],
    ] as [number, TrollFearLevel][],

    FEAR_FACTOR: 0.1,

    TROLL_SPEED: 500,

    PASS_COST: 0.33,

    TROLL_LEVELING: {
        1: {
            maxHp: 10,
            maxHunger: 10,
            block: 0,
            dmg: [3, 6],
            xp: 10,
            xpRewards: {
                [CharKey.FARMER]: 1,
                [CharKey.MILITIA]: 5,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
                [CharKey.VIGILANTE]: 100,
            },
            newAbilities: [TrollAbility.MAN_EATER],
        },
        2: {
            maxHp: 20,
            maxHunger: 15,
            block: 0,
            dmg: [5, 10],
            xp: 50,
            xpRewards: {
                [CharKey.FARMER]: 1,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
                [CharKey.VIGILANTE]: 100,
            },
            newAbilities: [TrollAbility.THROW_ROCK],
        },
        3: {
            maxHp: 40,
            maxHunger: 20,
            block: 0,
            dmg: [10, 20],
            xp: 100,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
                [CharKey.VIGILANTE]: 100,
            },
            newAbilities: [TrollAbility.GRAPPLE],
        },
        4: {
            maxHp: 60,
            maxHunger: 10,
            block: 0,
            dmg: [15, 50],
            xp: 300,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 2,
                [CharKey.ARCHER]: 5,
                [CharKey.SHIELDMAN]: 10,
                [CharKey.KNIGHT]: 50,
                [CharKey.VIGILANTE]: 100,
            },
            newAbilities: [],
        },
        5: {
            maxHp: 100,
            maxHunger: 10,
            block: 0,
            dmg: [20, 40],
            xp: -1,
            xpRewards: {
                [CharKey.FARMER]: 0,
                [CharKey.MILITIA]: 0,
                [CharKey.ARCHER]: 0,
                [CharKey.SHIELDMAN]: 0,
                [CharKey.KNIGHT]: 0,
                [CharKey.VIGILANTE]: 0,
            },
            newAbilities: [],
        },
    } as {[key: number]: LevelReqs},
}