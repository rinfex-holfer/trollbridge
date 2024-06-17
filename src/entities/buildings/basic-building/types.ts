export enum BuildingEvent {
    BASE_EVENT = "BASE_EVENT",
}

export type BuildingEventPayload = {
    [BuildingEvent.BASE_EVENT]: undefined
}

export type BuildingProps = {
    id: string
}