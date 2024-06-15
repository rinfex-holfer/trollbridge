export type BedProps = {
    level: 1 | 2 | 3
}

export enum BedEvent {
    BED_CLICKED = "BED_CLICKED",
}

export type BedEventPayload = {
    [BedEvent.BED_CLICKED]: undefined
}