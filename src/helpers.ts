import {eventBus, Evt} from "./event-bus";
import {o_} from "./managers/locator";
import {TrollLocation} from "./types";

export function onEncounterStart() {
    console.log('onEncounterStart')
    o_.interaction.disableEverything()

    o_.troll.goToBattlePosition()
    o_.characters.setPrisonersInteractive(false)
    o_.characters.travellersGoToTalk();

    eventBus.emit(Evt.ENCOUNTER_STARTED);
}

export function onEncounterEnd() {
    console.log('onEncounterEnd')
    o_.interaction.enableEverything()

    o_.characters.enableInteractivityOnBridge();
    o_.characters.setPrisonersInteractive(true)

    eventBus.emit(Evt.ENCOUNTER_ENDED);
}

export function onTrollCameToBridge() {
    o_.troll.location = TrollLocation.BRIDGE;
    o_.lair.mayButtonsBeClicked(false)
    o_.lair.mayBeMovedInto(true)
    o_.bridge.disableInterface()
    o_.upgrade.setEnabled(false)
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.BRIDGE);
}

export function onTrollCameToLair() {
    o_.troll.location = TrollLocation.LAIR;
    o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(false)
    o_.bridge.enableInterface()
    o_.upgrade.setEnabled(true)
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);
}

export function onTrollSleep() {
    o_.troll.location = TrollLocation.LAIR;
    // o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(true)
    o_.bridge.enableInterface();
}