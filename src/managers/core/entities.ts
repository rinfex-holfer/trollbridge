import {o_} from "../locator";
import {findAndSplice} from "../../utils/utils-misc";
import {Meat} from "../../entities/meat";
import {Gold} from "../../entities/gold";

export abstract class GameEntity<T extends EntityType> {
    abstract type: T
    abstract id: string

    register(): string {
        // @ts-ignore
        return o_.entities.register(this.type, this)
    }

    deregister() {
        // @ts-ignore
        o_.entities.deregister(this)
    }
}

export const enum EntityType {
    MEAT = 'MEAT',
    GOLD = 'GOLD',
}

type EntityMap = {
    [EntityType.MEAT]: Meat,
    [EntityType.GOLD]: Gold,
}

type EntityStorage = {
    [T in EntityType]: EntityMap[T][]
}

export class EntityManager {
    private entities: EntityStorage = {
        [EntityType.MEAT]: [],
        [EntityType.GOLD]: [],
    }

    private entityNextId = {
        [EntityType.MEAT]: 0,
        [EntityType.GOLD]: 0,
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