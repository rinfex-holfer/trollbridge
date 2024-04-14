import {eventBus, Evt} from "./event-bus";
import {o_} from "./managers/locator";
import {TrollLocation} from "./types";
import {O_Sprite} from "./managers/core/render/sprite";
import {O_Container} from "./managers/core/render/container";
import {getRndSign} from "./utils/utils-math";
import {pause} from "./utils/utils-async";
import {SOUND_KEY} from "./managers/core/audio";

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

    if (o_.game.isGameover) return

    o_.interaction.enableEverything()

    o_.characters.enableInteractivityOnBridge();
    o_.characters.setPrisonersInteractive(true)

    eventBus.emit(Evt.ENCOUNTER_ENDED);
}

export function onTrollCameToBridge() {
    console.log("======== onTrollCameToBridge")
    o_.troll.location = TrollLocation.BRIDGE;
    o_.lair.mayButtonsBeClicked(false)
    o_.lair.mayBeMovedInto(true)
    o_.lair.menu.hide()
    o_.bridge.disableInterface()
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.BRIDGE);
}

export function onTrollGoesToBridge() {
    console.log("======== onTrollGoesToBridge")
    o_.lair.mayButtonsBeClicked(false)
    o_.lair.mayBeMovedInto(false)
    o_.lair.menu.hide()
    o_.bridge.disableInterface()
    // o_.camera.panToBridge()
}

export function onTrollGoesToLair() {
    console.log("======== onTrollGoesToLair")
    o_.lair.mayButtonsBeClicked(false)
    o_.lair.mayBeMovedInto(false)
    // o_.camera.panToLair()
}

export function onTrollCameToLair() {
    console.log("======== onTrollCameToLair")
    o_.troll.location = TrollLocation.LAIR;
    o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(false)
    o_.lair.menu.show()
    o_.bridge.enableInterface()
    eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);
}

export function onTrollSleep() {
    o_.troll.location = TrollLocation.LAIR;
    // o_.lair.mayButtonsBeClicked(true)
    o_.lair.mayBeMovedInto(true)
    o_.bridge.enableInterface();
}

export function destroyInteractiveObjWithJump(obj: { destroy: Function, sprite?: O_Sprite, container?: O_Container }) {
    const a = obj.sprite || obj.container
    if (!a) return

    o_.render.thrownTo(a, {x: a.x + (getRndSign() * 100), y: a.y}, 600)
    o_.render.fadeOut(a, 300)
    pause(500).then(() => obj.destroy())

    o_.audio.playSound(SOUND_KEY.BONK)
}

export function destroyInteractiveObjWithFade(obj: { destroy: Function, sprite?: O_Sprite, container?: O_Container }) {
    const a = obj.sprite || obj.container
    if (!a) return

    o_.render.fadeOut(a, 500)
    pause(600).then(() => obj.destroy())
}