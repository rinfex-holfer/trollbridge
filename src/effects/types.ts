import {EffectRotten} from "./rotten";
import {EffectHighlight} from "./highlight";

export enum EffectType {
    ROTTEN = "ROTTEN",
    HIGHLIGHTED = "HIGHLIGHTED",
}

export type EffectToTypeMap = {
    [EffectType.ROTTEN]: EffectRotten
    [EffectType.HIGHLIGHTED]: EffectHighlight
}