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
    ENCOUNTER_CHANGED = 'ENCOUNTER_CHANGED',

    CHAR_LEFT_BRIDGE = 'CHAR_LEFT_BRIDGE',
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
    [Evt.ENCOUNTER_CHANGED]: undefined,
    [Evt.TROLL_LOCATION_CHANGED]: undefined,
    [Evt.CHAR_LEFT_BRIDGE]: string,
}

export const eventBus = {
    subs: {} as {[key: string]: [number, any][]},

    on: function on<E extends Evt>(eventType: E, callback: (data: EvtData[E]) => void) {
        if (!this.subs[eventType]) {
            this.subs[eventType] = [];
        }

        this.subs[eventType].push([nextId++, callback]);

        // console.log(eventType);

        return nextId - 1;
    },

    unsubscribe: function unsubscribe(eventType: Evt, id: number) {
        // console.log('unsubscribe', eventType, id);
        const subIndex = this.subs[eventType].findIndex(sub => sub[0]);
        if (subIndex > -1) this.subs[eventType].splice(subIndex, 1)
        else console.error('already unsubscribed', eventType, id)
    },

    emit: function<E extends Evt>(eventType: E, data?: EvtData[E]) {
        console.log('emit', eventType, this.subs[eventType]);
        this.subs[eventType]?.forEach(sub => sub[1](data))
    }
}