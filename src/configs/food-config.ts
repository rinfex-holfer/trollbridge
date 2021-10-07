import {FoodType} from "../types";

export const foodConfig = {
    RAW_MEAT_TIME_LIMIT: 6,
    STALE_MEAT_TIME_LIMIT: 6,

    FOOD_FOR_DISH: 3,

    FOOD_FROM_CHARACTER: 4,
    FOOD_FROM_DEVOURED_CHARACTER: 3,

    FOOD: {
        [FoodType.MEAT]: {
            ANIMAL: {
                hp: 2,
                xp: 6,
                hunger: -3,
                selfControl: -1,
            },
            ANIMAL_STALE: {
                hp: 1,
                xp: 1,
                hunger: -3,
                selfControl: -2,
            },
            HUMAN: {
                hp: 4,
                xp: 6,
                hunger: -4,
                selfControl: -5,
            },
            HUMAN_STALE: {
                hp: 2,
                xp: 1,
                hunger: -4,
                selfControl: -10,
            }
        },
        [FoodType.DISH]: {
            ANIMAL: {
                hp: 6,
                xp: 24,
                hunger: -10,
                selfControl: 0
            },
            ANIMAL_STALE: {
                hp: 3,
                xp: 4,
                hunger: -8,
                selfControl: -1
            },
            HUMAN: {
                hp: 10,
                xp: 24,
                hunger: -12,
                selfControl: -10
            },
            HUMAN_STALE: {
                hp: 2,
                xp: 4,
                hunger: -10,
                selfControl: -15
            }
        },
    },
}