export type ChairProps = {
    level: 1 | 2 | 3 | 4
}

export enum ChairEvent {
    CHAIR_CLICKED = "CHAIR_CLICKED",
}

export type ChairEventPayload = {
    [ChairEvent.CHAIR_CLICKED]: undefined
}