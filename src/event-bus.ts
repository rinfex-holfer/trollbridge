import {CharKey, EncounterDanger, TrollLocation} from "./types";
import {TrollFearLevel} from "./managers/game/troll/types";
import {Settings} from "./managers/core/settings";
import {PotState} from "./entities/buildings/pot";
import {MenuParams, MenuScreen} from "./managers/core/menu";
import {Vec} from "./utils/utils-math";
import {GamePointerEvent} from "./managers/core/input/types";
import {ItemType} from "./entities/items/types";
import {BaseItem, BaseItemAny} from "./entities/items/base-item/base-item";

let nextId = 0;

export const enum Evt {
    GAME_LOADING_STARTED = 'GAME_LOADING_STARTED',
    GAME_LOADING_PROGRESS = 'GAME_LOADING_PROGRESS',
    GAME_LOADING_FINISHED = 'GAME_LOADING_FINISHED',

    INTERFACE_LAIR_CLICKED = 'INTERFACE_LAIR_CLICKED',
    INTERFACE_BRIDGE_CLICKED = 'INTERFACE_BRIDGE_CLICKED',

    INTERFACE_BED_CLICKED = 'INTERFACE_BED_CLICKED',
    INTERFACE_SLEEP_BUTTON_CLICKED = 'INTERFACE_SLEEP_BUTTON_CLICKED',

    INTERFACE_CHAIR_CLICKED = 'INTERFACE_CHAIR_CLICKED',
    INTERFACE_WAIT_BUTTON_CLICKED = 'INTERFACE_WAIT_BUTTON_CLICKED',

    INTERFACE_POT_CLICKED = 'INTERFACE_POT_CLICKED',
    INTERFACE_TOOLS_CLICKED = 'INTERFACE_TOOLS_CLICKED',

    INTERFACE_MENU_OPENED = 'INTERFACE_MENU_OPENED',
    INTERFACE_MENU_CLOSED = 'INTERFACE_MENU_CLOSED',
    INTERFACE_MENU_SCREEN_CHANGED = 'INTERFACE_MENU_SCREEN_CHANGED',

    LANGUAGE_CHANGED = 'LANGUAGE_CHANGED',

    BUILDING_COMPLETED = 'BUILDING_COMPLETED',

    SETTINGS_CHANGED = 'SETTINGS_CHANGED',

    TIME_PASSED = 'TIME_PASSED',
    ALL_GIVEN = 'ALL_GIVEN',
    PAYMENT_GIVEN = 'PAYMENT_GIVEN',

    FOOD_PREPARATION_STARTED = 'FOOD_PREPARATION_STARTED',

    BATTLE_STARTED = 'BATTLE_STARTED',
    BATTLE_WON = 'BATTLE_WON',
    BATTLE_DEFEAT = 'BATTLE_DEFEAT',
    BATTLE_END = 'BATTLE_END',

    BATTLE_TRAVELLERS_TURN_END = 'BATTLE_TRAVELLERS_TURN_END',

    BYPASSED = 'BYPASSED',
    GAME_OVER = 'GAME_OVER',
    GAME_WIN = 'GAME_WIN',

    TROLL_STATS_CHANGED = 'TROLL_STATS_CHANGED',
    TROLL_LOCATION_CHANGED = 'TROLL_LOCATION_CHANGED',
    RESOURSES_CHANGED = 'RESOURSES_CHANGED',
    NEGOTIATION_STARTED = 'NEGOTIATION_STARTED',

    TRAVELLERS_APPEAR = 'TRAVELLERS_APPEAR',
    ENCOUNTER_ENDED = 'ENCOUNTER_ENDED',
    CHAR_LEFT_BRIDGE = 'CHAR_LEFT_BRIDGE',
    CHARS_PASSED_AFTER_ASKING = 'CHARS_PASSED_AFTER_ASKING',
    CHAR_READY_TO_TALK = 'CHAR_READY_TO_TALK',

    FEAR_CHANGES = 'FEAR_CHANGES',
    VIGILANTE_PLANNED = 'VIGILANTE_PLANNED',

    CHAR_DEFEATED = 'CHAR_DEFEATED',
    CHAR_DEVOURED_IN_BATTLE = 'CHAR_DEVOURED_IN_BATTLE',
    CHAR_DEVOURED = 'CHAR_DEVOURED',
    CHAR_TORN_APART = 'CHAR_TORN_APART',

    ITEM_CREATED = 'ITEM_CREATED',
}

export type EvtData = {
    [Evt.GAME_LOADING_STARTED]: undefined,
    [Evt.GAME_LOADING_PROGRESS]: number,
    [Evt.GAME_LOADING_FINISHED]: undefined,

    [Evt.INTERFACE_LAIR_CLICKED]: {
        event: GamePointerEvent
    },
    [Evt.INTERFACE_BRIDGE_CLICKED]: {
        event: GamePointerEvent
    },
    [Evt.INTERFACE_BED_CLICKED]: undefined,
    [Evt.INTERFACE_SLEEP_BUTTON_CLICKED]: undefined,

    [Evt.INTERFACE_CHAIR_CLICKED]: undefined,
    [Evt.INTERFACE_WAIT_BUTTON_CLICKED]: undefined,

    [Evt.INTERFACE_POT_CLICKED]: PotState,
    [Evt.INTERFACE_TOOLS_CLICKED]: undefined,

    [Evt.INTERFACE_MENU_OPENED]: undefined,
    [Evt.INTERFACE_MENU_CLOSED]: undefined,
    [Evt.INTERFACE_MENU_SCREEN_CHANGED]: [MenuScreen, MenuParams],

    [Evt.LANGUAGE_CHANGED]: undefined,

    [Evt.BUILDING_COMPLETED]: undefined,

    [Evt.SETTINGS_CHANGED]: Settings,

    [Evt.ALL_GIVEN]: undefined,
    [Evt.PAYMENT_GIVEN]: undefined,

    [Evt.FOOD_PREPARATION_STARTED]: undefined,

    [Evt.BATTLE_TRAVELLERS_TURN_END]: undefined,
    [Evt.CHARS_PASSED_AFTER_ASKING]: undefined,
    [Evt.BATTLE_WON]: EncounterDanger,
    [Evt.BATTLE_DEFEAT]: EncounterDanger,
    [Evt.BATTLE_END]: undefined,
    [Evt.BATTLE_STARTED]: undefined,

    [Evt.BYPASSED]: undefined,
    [Evt.TIME_PASSED]: number,

    [Evt.GAME_OVER]: undefined,
    [Evt.GAME_WIN]: string,

    [Evt.TROLL_STATS_CHANGED]: undefined,
    [Evt.RESOURSES_CHANGED]: undefined,
    [Evt.NEGOTIATION_STARTED]: undefined,
    [Evt.TROLL_LOCATION_CHANGED]: TrollLocation,
    [Evt.TRAVELLERS_APPEAR]: undefined,
    [Evt.ENCOUNTER_ENDED]: undefined,
    [Evt.CHAR_LEFT_BRIDGE]: string,
    [Evt.CHAR_READY_TO_TALK]: string,

    [Evt.FEAR_CHANGES]: TrollFearLevel,
    [Evt.VIGILANTE_PLANNED]: number,

    [Evt.CHAR_DEFEATED]: CharKey,
    [Evt.CHAR_DEVOURED_IN_BATTLE]: CharKey,
    [Evt.CHAR_DEVOURED]: CharKey,
    [Evt.CHAR_TORN_APART]: CharKey,

    [Evt.ITEM_CREATED]: string
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

    emit: function <E extends Evt>(eventType: E, data?: EvtData[E]) {
        if (this.subs[eventType]) {
            // console.log('emit', eventType, "subs:", Object.keys(this.subs[eventType]).length);
        } else {
            // console.log('emit', eventType, "no subs");
        }

        if (!this.subs[eventType]) return;

        Object.values(this.subs[eventType]).forEach(sub => sub(data))
    }
}

export function eventBusSubscriptions() {
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