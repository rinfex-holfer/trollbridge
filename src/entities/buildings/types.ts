import {ChairEvent, ChairEventPayload, ChairProps} from "./chair/types";
import {BedEvent, BedEventPayload, BedProps} from "./bed/types";
import {Chair} from "./chair/chair";
import {Bed} from "./bed/bed";
import {Tools} from "./tools/tools";
import {ToolsEvent, ToolsEventPayload, ToolsProps} from "./tools/types";

export const enum BuildingType {
    CHAIR = 'CHAIR',
    BED = 'BED',
    TOOLS = 'TOOLS',
}

export interface BuildingsPropsMap {
    [BuildingType.CHAIR]: ChairProps,
    [BuildingType.BED]: BedProps,
    [BuildingType.TOOLS]: ToolsProps,
}

// ======== events

export type BuildingEvents = {
    [BuildingType.CHAIR]: ChairEvent,
    [BuildingType.BED]: BedEvent,
    [BuildingType.TOOLS]: ToolsEvent,
}

export type BuildingEventsPayload = {
    [BuildingType.CHAIR]: ChairEventPayload,
    [BuildingType.BED]: BedEventPayload,
    [BuildingType.TOOLS]: ToolsEventPayload,
}
