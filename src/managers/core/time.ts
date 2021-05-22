import {TimeOrder} from "../../constants";
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
    }

    sub(fn:UpdateListener) {
        this.listeners.push([nextId++, fn]);
    }

    unsub(id: number) {
        this.listeners = this.listeners.filter(l => l[0] !== id);
    }

    onUpdate(dt: number) {
        this.listeners.forEach(l => l[1](dt))
    }

    wait() {
        const timeIndex = TimeOrder.indexOf(this.time);
        if (timeIndex === TimeOrder.length - 1) {
            this.day = this.day + 1;
            this.time = TimeOrder[0];
        } else {
            this.time = TimeOrder[timeIndex + 1];
        }

        eventBus.emit(Evt.TIME_PASSED);
    }
}