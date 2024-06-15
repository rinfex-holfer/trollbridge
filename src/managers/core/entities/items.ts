import {o_} from "../../locator";
import {findAndSplice} from "../../../utils/utils-misc";

import {ItemMap, ItemType} from "../../../entities/items/types";


type ItemStorage = {
    [T in ItemType]: ItemMap[T][]
}

export class ItemManager {
    private entities: ItemStorage = {
        [ItemType.MEAT]: [],
        [ItemType.DISH]: [],
        [ItemType.GOLD]: [],
        [ItemType.ROCK]: [],
    }

    private entityNextId = {
        [ItemType.MEAT]: 0,
        [ItemType.DISH]: 0,
        [ItemType.GOLD]: 0,
        [ItemType.ROCK]: 0,
    } as { [T in ItemType]: number }

    constructor() {
        o_.register.entities(this)
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
}