import {O_EventEmitter} from "../../../utils/utils-events";
import {GameInputEvent} from "./domain";

export const GAME_INPUT_EVENT = "GAME_INPUT_EVENT"

// export type SignalEmitter = O_EventEmitter<typeof INPUT_SIGNAL, {['INPUT_SIGNAL']: InputSignal}>
export abstract class GameInputEventEmitter extends O_EventEmitter<typeof GAME_INPUT_EVENT, {
    ['GAME_INPUT_EVENT']: GameInputEvent
}> {
}