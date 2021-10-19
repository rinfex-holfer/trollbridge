import {CharKey, EncounterDanger, TrollLocation} from "./types";
import {TrollFearLevel} from "./managers/game/troll/types";

let nextId = 0;

export const enum Evt {
    TIME_PASSED = 'TIME_PASSED',
    ALL_GIVEN = 'ALL_GIVEN',
    PAYMENT_GIVEN = 'PAYMENT_GIVEN',

    BATTLE_STARTED = 'BATTLE_STARTED',
    BATTLE_WON = 'BATTLE_WON',
    BATTLE_DEFEAT = 'BATTLE_DEFEAT',
    BATTLE_END = 'BATTLE_END',

    BATTLE_TRAVELLERS_TURN_END = 'BATTLE_TRAVELLERS_TURN_END',

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
    CHARS_PASSED_AFTER_ASKING = 'CHARS_PASSED_AFTER_ASKING',
    CHAR_READY_TO_TALK = 'CHAR_READY_TO_TALK',
    TROLL_TURN_END = 'TROLL_TURN_END',

    FEAR_CHANGES = 'FEAR_CHANGES',

    CHAR_DEFEATED = 'CHAR_DEFEATED',
    CHAR_DEVOURED_IN_BATTLE = 'CHAR_DEVOURED_IN_BATTLE',
    CHAR_DEVOURED = 'CHAR_DEVOURED',
    CHAR_TORN_APART = 'CHAR_TORN_APART',
}

export type EvtData = {
    [Evt.ALL_GIVEN]: undefined,
    [Evt.PAYMENT_GIVEN]: undefined,

    [Evt.BATTLE_STARTED]: undefined,
    [Evt.BATTLE_TRAVELLERS_TURN_END]: undefined,
    [Evt.CHARS_PASSED_AFTER_ASKING]: undefined,
    [Evt.BATTLE_WON]: EncounterDanger,
    [Evt.BATTLE_DEFEAT]: EncounterDanger,
    [Evt.BATTLE_END]: undefined,

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

    [Evt.FEAR_CHANGES]: TrollFearLevel,

    [Evt.CHAR_DEFEATED]: CharKey,
    [Evt.CHAR_DEVOURED_IN_BATTLE]: CharKey,
    [Evt.CHAR_DEVOURED]: CharKey,
    [Evt.CHAR_TORN_APART]: CharKey,
}

type Subscribers = {
    [eventType: string]: {
        [subId: number]: (data: any) => void
    }
}

export type GameEventCallback<E extends Evt> = (data: EvtData[E]) => void

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

export function subscriptions() {
    const subs = [] as [number, Evt][]

    return {
        on: <E extends Evt>(event: E, callback: GameEventCallback<E>) => {
            const id = eventBus.on(event, callback)
            subs.push([id, event])
        },
        clear: () => {
            subs.forEach(([id, evt]) => eventBus.unsubscribe(evt, id))
        }
    }
}

// @ts-ignore
window.eventBus = eventBus;