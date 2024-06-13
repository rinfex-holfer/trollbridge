import {o_} from "../managers/locator";
import {TrollLocation} from "../types";
import {eventBus, Evt} from "../event-bus";
import {CancellablePromise, CANCELLED, createCancellablePromise, createPromiseAndHandlers} from "../utils/utils-async";
import {GamePhase} from "./game-phase";
import {PotState} from "../entities/buildings/pot";
import {PhaseMakeFood} from "./phase-make-food";
import {PhaseBuild} from "./phase-build";
import {PhaseLair} from "./phase-lair";

export class PhaseBridge extends GamePhase {

    name = "bridge"

    activity?: {
        promise: CancellablePromise,
        cancel: () => void,
    }

    onStart() {
        this.registerListener(Evt.INTERFACE_BRIDGE_CLICKED, this.trollGoesToBridge)
        this.registerListener(Evt.INTERFACE_LAIR_CLICKED, this.trollGoesToLair)

        o_.troll.setLocation(TrollLocation.BRIDGE);
        o_.camera.panToBridge()
        this.trollGoesToBridge()
    }

    onEnd() {
        this.interfaceFor.cleanup()
    }

    setCurrentTrollActivity(runActivity: () => Promise<any>): CancellablePromise<void> {
        if (this.activity) {
            this.activity.cancel()
        }

        const {promise, done, cancel} = createCancellablePromise()

        runActivity().then(() => {
            done()
        })

        this.activity = {
            promise,
            cancel,
        }

        return promise;
    }

    interfaceFor = {
        idleOnBridge: () => {
            console.log("interfaceFor idleOnBridge")
            o_.lair.setClickable(true)

            o_.bridge.setInteractive.all(true)
            o_.bridge.setInteractive.surface(false)
        },
        goesToLair: () => {
            console.log("interfaceFor goesToLair")
            o_.lair.setClickable(false)

            o_.bridge.setInteractive.all(false)
            o_.bridge.setInteractive.surface(true)
        },
        cleanup: () => {
            console.log("interfaceFor cleanup")
            o_.lair.setClickable(false)
            o_.bridge.setInteractive.all(false)
        },
    }

    trollGoesToBridge = async () => {
        const resPromise = this.setCurrentTrollActivity(o_.troll.goToBridge)
        this.interfaceFor.idleOnBridge()
        const res = await resPromise
        if (res === CANCELLED) return
    }

    trollGoesToLair = async () => {
        this.interfaceFor.goesToLair();
        o_.camera.panToLair()

        const res = await this.setCurrentTrollActivity(o_.troll.goToLadder);

        if (res === "CANCELLED") {
            o_.camera.panToBridge()
            return
        }

        // TODO climb stairs
        this.goToNextPhase(new PhaseLair())
    }
}