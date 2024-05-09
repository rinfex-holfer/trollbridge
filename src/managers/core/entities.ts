import {o_} from "../locator";
import {findAndSplice} from "../../utils/utils-misc";

import {EntityMap, EntityType} from "../../entities/types";


type EntityStorage = {
    [T in EntityType]: EntityMap[T][]
}

export class EntityManager {
    private entities: EntityStorage = {
        [EntityType.MEAT]: [],
        [EntityType.DISH]: [],
        [EntityType.GOLD]: [],
        [EntityType.ROCK]: [],
    }

    private entityNextId = {
        [EntityType.MEAT]: 0,
        [EntityType.DISH]: 0,
        [EntityType.GOLD]: 0,
        [EntityType.ROCK]: 0,
    } as { [T in EntityType]: number }

    constructor() {
        o_.register.entities(this)
    }

    public register<T extends EntityType>(entityType: T, entity: EntityMap[T]) {
        (this.entities[entityType] as EntityMap[T][]).push(entity)
        const e = this.entities[entityType]

        const id = this.entityNextId[entityType]
        this.entityNextId[entityType]++;
        return entityType + '_' + id;
    }

    public get<T extends EntityType>(type: T): EntityStorage[T] {
        return this.entities[type]
    }

    public deregister<T extends EntityType>(entity: EntityMap[T]) {
        const res = findAndSplice(this.entities[entity.type] as EntityMap[T][], entity)
        if (!res) console.warn('entity', entity.id, 'was not found entityManager therefore not deregistered')
    }

    public getAll() {
        return Object.values(this.entities).flat()
    }
}