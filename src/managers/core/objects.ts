import {Meat} from "../../entities/meat";
import {o_} from "../locator";

export const enum ObjectType {
    MEAT = 'MEAT',
}

interface ObjectsMap {
    [ObjectType.MEAT]: Meat[]
}

// TODO make it typed
export class ObjectsManager {
    private objects: ObjectsMap = {
        [ObjectType.MEAT]: []
    }

    constructor() {
        o_.register.objects(this)
    }

    addMeat(meat: Meat) {
        this.objects[ObjectType.MEAT].push(meat);
    }

    getMeat() {
        return this.objects[ObjectType.MEAT]
    }
}