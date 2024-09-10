import {MeatEvent, MeatEventsPayload} from "./meat/meat-events";
import {Meat} from "./meat/meat";
import {Dish} from "./dish/dish";
import {Gold, GoldData} from "./gold";
import {Rock} from "./rock";
import {DishEvent, DishEventsPayload} from "./dish/dish-events";

export interface Item<T extends ItemType> {
    type: T,
    id: string
    register: () => string,
    deregister: () => void,
}

export interface ItemDataMap {
    [ItemType.DISH]: {
        isHuman: boolean,
        isStale: boolean,
    },
    [ItemType.MEAT]: {
        isHuman: boolean,
        isStale: boolean,
    },
    [ItemType.GOLD]: GoldData,
    [ItemType.ROCK]: {}
}

export const enum ItemType {
    MEAT = 'MEAT',
    DISH = 'DISH',
    GOLD = 'GOLD',
    ROCK = 'ROCK',
}

export type ItemMap = {
    [ItemType.MEAT]: Meat,
    [ItemType.DISH]: Dish,
    [ItemType.GOLD]: Gold,
    [ItemType.ROCK]: Rock,
}

export type ItemEvents = {
    [ItemType.MEAT]: MeatEvent,
    [ItemType.DISH]: DishEvent,
    [ItemType.GOLD]: DishEvent,
    [ItemType.ROCK]: DishEvent,
}

export type ItemEventPayload = {
    [ItemType.MEAT]: MeatEventsPayload,
    [ItemType.DISH]: DishEventsPayload,
    [ItemType.GOLD]: DishEventsPayload,
    [ItemType.ROCK]: DishEventsPayload,
}
