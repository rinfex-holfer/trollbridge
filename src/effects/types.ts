import {EffectRotten} from "./rotten";

export enum EffectType {
    ROTTEN = "ROTTEN"
}

export type EffectToTypeMap = {
    [EffectType.ROTTEN]: EffectRotten
}