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
            this.unsubscribe(eventType, id);
            callback(...args);
        })
        return id;
    }

    unsubscribe = (eventType: Events, id: number) => {
        const subscriber = this.subs[eventType][id];
        if (!!subscriber) delete this.subs[eventType][id]
    }

    emit = (eventType: Events, data?: PayloadOrUndefined<Events, EventsPayloadMap>) => {
        if (!this.subs[eventType]) return;

        Object.values(this.subs[eventType]).forEach(sub => sub(data))
    }
}
