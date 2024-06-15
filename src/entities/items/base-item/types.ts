export enum BaseItemEvent {
    DESTROYED = "DESTROYED",
}

export type BaseItemEventPayload = {
    [BaseItemEvent.DESTROYED]: undefined,
}