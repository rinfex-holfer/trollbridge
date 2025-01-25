import {eventBus, Evt, EvtData} from "../event-bus";
import {createPromiseAndHandlers} from "../utils/utils-async";
import {PhaseKey} from "./domain";
import {BaseItem} from "../entities/items/base-item/base-item";
import {ItemType} from "../entities/items/types";


export abstract class GamePhase {
    listeners: [event: Evt, listenerId: number][] = []

    private finishPhasePromise: Promise<GamePhase>
    protected goToNextPhase: (nextPhase: GamePhase) => void

    abstract readonly name: PhaseKey

    constructor() {
        const {promise, done} = createPromiseAndHandlers<GamePhase>()
        this.finishPhasePromise = promise
        this.goToNextPhase = done
    }

    pause = () => {

    }

    unpause = () => {

    }

    protected registerListener<E extends Evt>(eventType: E, callback: (data: EvtData[E]) => void) {
        const id = eventBus.on(eventType, callback)
        this.listeners.push([eventType, id])
    }

    run() {
        this.onStart()
        return this.finishPhasePromise;
    }

    end() {
        this.listeners.forEach(listener => {
            eventBus.unsubscribe(listener[0], listener[1])
        })

        this.onEnd()
    }

    protected onStart() {

    }

    protected onEnd() {

    }
}