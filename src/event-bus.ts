import {CharKey, TrollLocation} from "./types";

let nextId = 0;

export const enum Evt {
    TIME_PASSED = 'TIME_PASSED',
    ALL_GIVEN = 'ALL_GIVEN',
    PAYMENT_GIVEN = 'PAYMENT_GIVEN',
    BATTLE_STARTED = 'BATTLE_STARTED',
    BYPASSED = 'BYPASSED',
    GAME_OVER = 'GAME_OVER',

    TROLL_STATS_CHANGED = 'TROLL_STATS_CHANGED',
    TROLL_LOCATION_CHANGED = 'TROLL_LOCATION_CHANGED',
    RESOURSES_CHANGED = 'RESOURSES_CHANGED',
    NEGOTIATION_STARTED = 'NEGOTIATION_STARTED',

    TRAVELLERS_APPEAR = 'TRAVELLERS_APPEAR',
    ENCOUNTER_ENDED = 'ENCOUNTER_ENDED',
    ENCOUNTER_STARTED = 'ENCOUNTER_STARTED',
    CHAR_LEFT_BRIDGE = 'CHAR_LEFT_BRIDGE',
    CHAR_READY_TO_TALK = 'CHAR_READY_TO_TALK',
    TROLL_TURN_END = 'TROLL_TURN_END',

    CHAR_DEFEATED = 'CHAR_DEFEATED',
    CHAR_DEVOURED_IN_BATTLE = 'CHAR_DEVOURED_IN_BATTLE',
}

export type EvtData = {
    [Evt.ALL_GIVEN]: undefined,
    [Evt.PAYMENT_GIVEN]: undefined,
    [Evt.BATTLE_STARTED]: undefined,
    [Evt.BYPASSED]: undefined,
    [Evt.TIME_PASSED]: undefined,
    [Evt.GAME_OVER]: undefined,
    [Evt.TROLL_STATS_CHANGED]: undefined,
    [Evt.RESOURSES_CHANGED]: undefined,
    [Evt.NEGOTIATION_STARTED]: undefined,
    [Evt.TROLL_LOCATION_CHANGED]: TrollLocation,
    [Evt.TRAVELLERS_APPEAR]: undefined,
    [Evt.ENCOUNTER_ENDED]: undefined,
    [Evt.ENCOUNTER_STARTED]: undefined,
    [Evt.CHAR_LEFT_BRIDGE]: string,
    [Evt.CHAR_READY_TO_TALK]: string,
    [Evt.TROLL_TURN_END]: undefined,

    [Evt.CHAR_DEFEATED]: CharKey,
    [Evt.CHAR_DEVOURED_IN_BATTLE]: CharKey,
}

type Subscribers = {
    [eventType: string]: {
        [subId: number]: (data: any) => void
    }
}

export const eventBus = {
    subs: {} as Subscribers,

    on: function on<E extends Evt>(eventType: E, callback: (data: EvtData[E]) => void) {
        if (!this.subs[eventType]) {
            this.subs[eventType] = {};
        }

        const subId = nextId;
        this.subs[eventType][subId] = callback;

        nextId++;

        return subId;
    },

    once: function once<E extends Evt>(eventType: E, callback: (data: EvtData[E]) => void) {
        let id = -1;
        id = this.on(eventType, (...args) => {
            this.unsubscribe(eventType, id);
            callback(...args);
        })
        return id;
    },

    unsubscribe: function unsubscribe(eventType: Evt, id: number) {
        const subscriber = this.subs[eventType][id];
        if (!!subscriber) delete this.subs[eventType][id]
    },

    emit: function<E extends Evt>(eventType: E, data?: EvtData[E]) {
        console.log('emit', eventType, this.subs[eventType]);

        if (!this.subs[eventType]) return;

        Object.values(this.subs[eventType]).forEach(sub => sub(data))
    }
}

// @ts-ignore
window.eventBus = eventBus;