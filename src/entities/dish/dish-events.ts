export enum DishEvent {
    WENT_STALE = "DISH_WENT_STALE",
}

export type DishEventsPayload = {
    [DishEvent.WENT_STALE]: undefined
}