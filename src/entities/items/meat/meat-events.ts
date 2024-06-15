export enum MeatEvent {
    WENT_STALE = "MEAT_WENT_STALE",
}

export type MeatEventsPayload = {
    [MeatEvent.WENT_STALE]: undefined
}