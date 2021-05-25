import {Meat} from "../../entities/meat";
import {o_} from "../locator";

export interface GameEntity<T extends EntityType> {
    entityType: T
}

export const enum EntityType {
    MEAT = 'MEAT',
}

type ObjectsMap = {
    [T in EntityType]: GameEntity<T>[]
}

export class ObjectsManager {
    private objects: ObjectsMap = {
        [EntityType.MEAT]: []
    }

    constructor() {
        o_.register.objects(this)
    }

    add<T extends EntityType>(entity: GameEntity<T>) {
        this.objects[entity.entityType].push(entity)
    }
}