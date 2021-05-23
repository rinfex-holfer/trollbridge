import {eventBus, Evt} from "./event-bus";
import {o_} from "./managers/locator";
import {TrollLocation} from "./types";

export function onEncounterStart() {
    o_.bridge.disableInterface()
    o_.lair.mayButtonsBeClicked(false)
    o_.lair.mayBeMovedInto(false)
    o_.characters.setPrisonersInteractive(false)
    o_.characters.travellersGoToTalk();

    eventBus.emit(Evt.ENCOUNTER_STARTED);
}

export function onEncounterEnd() {
    if (o_.troll.location !== TrollLocation.BRIDGE) o_.bridge.enableInterface()

    o_.lair.mayButtonsBeClicked(true)
    if (o_.troll.location !== TrollLocation.LAIR) o_.lair.mayBeMovedInto(true)

    o_.characters.setPrisonersInteractive(true)

    eventBus.emit(Evt.ENCOUNTER_ENDED);
}

export function onTrollCameToBridge() {
    o_.troll.location = TrollLocation.BRIDGE;
    o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(true)
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.BRIDGE);
}

export function onTrollCameToLair() {
    o_.troll.location = TrollLocation.LAIR;
    o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(false)
    o_.bridge.enableInterface();
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);
}

export function onTrollSleep() {
    o_.troll.location = TrollLocation.LAIR;
    // o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(true)
    o_.bridge.enableInterface();
}