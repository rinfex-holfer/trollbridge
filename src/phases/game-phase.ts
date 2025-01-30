import {eventBus, Evt, EvtData} from "../event-bus";
import {createPromiseAndHandlers} from "../utils/utils-async";
import {PhaseKey} from "./domain";
import {BaseItem} from "../entities/items/base-item/base-item";
import {ItemMap, ItemType} from "../entities/items/types";
import {o_} from "../managers/locator";


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

    onNewItems = (config: Partial<Record<ItemType, (item: any) => void>>) => {
        this.registerListener(Evt.ITEM_CREATED, ({type, id}) => {
            const cb = config[type]
            if (cb) {
                const item = o_.items.get(type).find(i => i.id === id)
                if (item) {
                    cb(item)
                }
            }
        });
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