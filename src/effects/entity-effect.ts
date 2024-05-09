import {EffectType} from "./types";


export abstract class EnityEffect {
    abstract type: EffectType

    abstract destroy(): void
}
