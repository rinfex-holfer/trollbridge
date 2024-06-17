import {EffectType} from "./types";


export abstract class EntityEffect {
    abstract type: EffectType

    abstract destroy(): void
}
