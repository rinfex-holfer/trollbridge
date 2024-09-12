import {EffectType} from "./types";


export abstract class EntityEffect<T extends EffectType = EffectType> {
    abstract type: T

    abstract destroy(): void
}
