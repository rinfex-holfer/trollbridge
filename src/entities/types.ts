import {MeatEvent, MeatEventsPayload} from "./meat/meat-events";
import {Meat} from "./meat/meat";
import {Dish} from "./dish/dish";
import {Gold} from "./gold";
import {Rock} from "./rock";
import {DishEvent, DishEventsPayload} from "./dish/dish-events";
import {BaseEvent, BaseEventPayload} from "./base-entity";
import {O_EventEmitter} from "../utils/utils-events";

export interface GameEntity<T extends EntityType> {
    type: T,
    id: string
    register: () => string,
    deregister: () => void,
}

export interface GameEntityPropsMap {
    [EntityType.DISH]: {
        isHuman: boolean,
        isStale: boolean,
    },
    [EntityType.MEAT]: {
        isHuman: boolean,
        isStale: boolean,
    },
    [EntityType.GOLD]: {
        amount: number
    },
    [EntityType.ROCK]: {}
}

export const enum EntityType {
    MEAT = 'MEAT',
    DISH = 'DISH',
    GOLD = 'GOLD',
    ROCK = 'ROCK',
}

export type EntityMap = {
    [EntityType.MEAT]: Meat,
    [EntityType.DISH]: Dish,
    [EntityType.GOLD]: Gold,
    [EntityType.ROCK]: Rock,
}

export type EntityEvents = {
    [EntityType.MEAT]: MeatEvent,
    [EntityType.DISH]: DishEvent,
    [EntityType.GOLD]: DishEvent,
    [EntityType.ROCK]: DishEvent,
}

export type EntityEventPayload = {
    [EntityType.MEAT]: MeatEventsPayload,
    [EntityType.DISH]: DishEventsPayload,
    [EntityType.GOLD]: DishEventsPayload,
    [EntityType.ROCK]: DishEventsPayload,
}
