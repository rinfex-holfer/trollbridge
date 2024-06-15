import {ChairEvent, ChairEventPayload, ChairProps} from "./chair/types";
import {BedEvent, BedEventPayload, BedProps} from "./bed/types";
import {Chair} from "./chair/chair";
import {Bed} from "./bed/bed";

export const enum BuildingType {
    CHAIR = 'CHAIR',
    BED = 'BED',
}

export interface Building<T extends BuildingType> {
    type: T,
    id: string
    register: () => string,
    deregister: () => void,
}

export type BuildingsMap = {
    [BuildingType.CHAIR]: Chair,
    [BuildingType.BED]: Bed,
}

export interface BuildingsPropsMap {
    [BuildingType.CHAIR]: ChairProps,
    [BuildingType.BED]: BedProps,
}

// ======== events

export type BuildingEvents = {
    [BuildingType.CHAIR]: ChairEvent,
    [BuildingType.BED]: BedEvent,
}

export type BuildingEventsPayload = {
    [BuildingType.CHAIR]: ChairEventPayload,
    [BuildingType.BED]: BedEventPayload,
}
