import {eventBus, Evt, EvtData} from "../event-bus";

type Subscribers = {
    [eventType: string]: {
        [subId: number]: (data: any) => void
    }
}

let lastId = 0

type PayloadOrUndefined<Events extends string, EventsPayloadMap extends object> = Events extends keyof EventsPayloadMap ? EventsPayloadMap[Events] : undefined

export class O_EventEmitter<Events extends string, EventsPayloadMap extends object> {
    subs = {} as Subscribers

    nextId = 0

    on = (eventType: Events, callback: (data: PayloadOrUndefined<Events, EventsPayloadMap>) => void) => {
        if (!this.subs[eventType]) {
            this.subs[eventType] = {};
        }

        const subId = this.nextId;
        this.subs[eventType][subId] = callback;

        this.nextId++;

        return subId;
    }

    once = <E extends Events>(eventType: E, callback: (data: PayloadOrUndefined<Events, EventsPayloadMap>) => void) => {
        let id = -1;
        id = this.on(eventType, (...args) => {
            this.off(eventType, id);
            callback(...args);
        })
        return id;
    }

    off = (eventType: Events, id: number) => {
        const subscriber = this.subs[eventType][id];
        if (!!subscriber) delete this.subs[eventType][id]
    }

    emit = (eventType: Events, data?: PayloadOrUndefined<Events, EventsPayloadMap>) => {
        if (!this.subs[eventType]) return;

        Object.values(this.subs[eventType]).forEach(sub => sub(data))
    }
}

export function createMessageEmitter<Message>() {
    type Handler = (message: Message) => void
    const subscribers = [] as [number, Handler][];
    let nextId = 0;

    return {
        sub: (handler: Handler) => {
            const id = nextId;
            subscribers.push([id, handler])
            nextId++
            return id;
        },
        unsub: (id: number) => {
            const idx = subscribers.findIndex(([subId, _]) => subId === id)
            if (idx > -1) subscribers.splice(idx, 1)
            else console.warn('no subscriber with id', id)
        },
        emit: (message: Message) => {
            subscribers.forEach(s => s[1](message))
        }
    }
}

export const sub = <E extends Evt>(e: E, cb: (data: EvtData[E]) => void) => {
    const unsubId = eventBus.on(e, cb)
    return () => eventBus.unsubscribe(e, unsubId)
}