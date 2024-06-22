import {TimeOrder} from "../../configs/constants";
import {eventBus, Evt} from "../../event-bus";
import {Time} from "../../types";
import {o_} from "../locator";

let nextId = 0
type UpdateListener = (dt: number) => void;

export class TimeManager {
    listeners = [] as [id: number, listener: UpdateListener][]

    day = 1

    time: Time = Time.MORNING

    constructor() {
        o_.register.time(this)

        eventBus.on(Evt.INTERFACE_SLEEP_BUTTON_CLICKED, () => this.wait(3))
        eventBus.on(Evt.INTERFACE_WAIT_BUTTON_CLICKED, () => this.wait(1))
    }

    sub(fn: UpdateListener): number {
        const lastId = nextId
        nextId++
        this.listeners.push([lastId, fn]);
        return lastId
    }

    unsub(id: number) {
        this.listeners = this.listeners.filter(l => l[0] !== id);
    }

    onUpdate(dt: number) {
        this.listeners.forEach(l => l[1](dt))
    }

    wait(timePassed: number) {
        const timeIndex = TimeOrder.indexOf(this.time);
        const nextTimeIndex = (timeIndex + timePassed) % TimeOrder.length;

        const isNextDay = timeIndex + timePassed > TimeOrder.length - 1
        if (isNextDay) {
            this.day = this.day + 1;
        }

        this.time = TimeOrder[nextTimeIndex];

        eventBus.emit(Evt.TIME_PASSED, timePassed);
    }
}