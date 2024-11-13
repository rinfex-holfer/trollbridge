import {o_} from "../locator";
import {findAndSplice} from "../../utils/utils-misc";

import {ItemDataMap, ItemMap, ItemType} from "../../entities/items/types";
import {Gold} from "../../entities/items/gold";
import {SaveData} from "../save-manager";
import {Meat} from "../../entities/items/meat/meat";
import {Dish} from "../../entities/items/dish/dish";


type ItemStorage = {
    [T in ItemType]: ItemMap[T][]
}

export interface ItemsData {
    entityNextId: { [T in ItemType]: number },
    entities: {
        [T in ItemType]: ItemDataMap[T][]
    };
}

export class ItemManager {
    private entities: ItemStorage = {
        [ItemType.MEAT]: [],
        [ItemType.DISH]: [],
        [ItemType.GOLD]: [],
        [ItemType.ROCK]: [],
    }

    public getData(): ItemsData {
        return {
            entityNextId: {
                ...this.entityNextId
            },
            entities: {
                [ItemType.GOLD]: this.entities[ItemType.GOLD].map(entity => entity.getData()),
                [ItemType.MEAT]: this.entities[ItemType.MEAT].map(entity => entity.getData()),
                [ItemType.DISH]: this.entities[ItemType.DISH].map(entity => entity.getData()),
                [ItemType.ROCK]: [],
            },
        }
    }

    clear() {
        this.getAll().forEach(entity => entity.destroy())
        this.entities = {
            [ItemType.MEAT]: [],
            [ItemType.DISH]: [],
            [ItemType.GOLD]: [],
            [ItemType.ROCK]: [],
        }
    }

    private entityNextId = {
        [ItemType.MEAT]: 0,
        [ItemType.DISH]: 0,
        [ItemType.GOLD]: 0,
        [ItemType.ROCK]: 0,
    } as { [T in ItemType]: number }

    constructor(saveData?: SaveData) {
        o_.register.items(this)

        this.entityNextId = {
            [ItemType.MEAT]: 0,
            [ItemType.DISH]: 0,
            [ItemType.GOLD]: 0,
            [ItemType.ROCK]: 0,
            ...saveData?.items?.entityNextId,
        }

        this.entities = {
            [ItemType.MEAT]: [],
            [ItemType.DISH]: [],
            [ItemType.GOLD]: [],
            [ItemType.ROCK]: [],
        }

        saveData?.items?.entities.GOLD.forEach((data) => {
            new Gold(data) // it will register itself
        })
        saveData?.items?.entities.MEAT.forEach((data) => {
            new Meat(data) // it will register itself
        })
        saveData?.items?.entities.DISH.forEach((data) => {
            new Dish(data) // it will register itself
        })
    }

    public register<T extends ItemType>(itemType: T, item: ItemMap[T]) {
        (this.entities[itemType] as ItemMap[T][]).push(item)
        const e = this.entities[itemType]

        const id = this.entityNextId[itemType]
        this.entityNextId[itemType]++;
        return itemType + '_' + id;
    }

    public get<T extends ItemType>(type: T): ItemStorage[T] {
        return this.entities[type]
    }

    public deregister<T extends ItemType>(entity: ItemMap[T]) {
        const res = findAndSplice(this.entities[entity.type] as ItemMap[T][], entity)
        if (!res) console.warn('entity', entity.id, 'was not found entityManager therefore not deregistered')
    }

    public getAll() {
        return Object.values(this.entities).flat()
    }

    public getAllNonCombat() {
        return [
            ...this.entities.GOLD,
            ...this.entities.MEAT,
            ...this.entities.DISH,
        ]
    }
}