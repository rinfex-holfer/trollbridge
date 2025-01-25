import {o_} from "../managers/locator";
import {TrollLocation} from "../types";
import {eventBus, Evt} from "../event-bus";
import {CancellablePromise, CANCELLED, createCancellablePromise} from "../utils/utils-async";
import {GamePhase} from "./game-phase";
import {PhaseLair} from "./phase-lair";
import {TrollStateKey} from "../managers/game/troll/troll-state";
import {Vec} from "../utils/utils-math";
import {positioner} from "../managers/game/positioner";
import {PhaseNegotiations} from "./phase-negotiations";
import {PhaseKeys} from "./domain";

export class PhaseBridge extends GamePhase {

    name = PhaseKeys.BRIDGE

    activity?: {
        promise: CancellablePromise,
        cancel: () => void,
    }

    initialDestination: Vec

    constructor(options?: { coord: Vec }) {
        super();
        console.log("PhaseBridge options", options)
        this.initialDestination = options?.coord || {...o_.troll.position}
    }

    onStart() {
        this.registerListener(Evt.INTERFACE_BRIDGE_CLICKED, (e) => this.trollGoesToBridge(e.event))
        this.registerListener(Evt.INTERFACE_LAIR_CLICKED, e => this.trollGoesToLair(e.event))
        this.registerListener(Evt.TRAVELLERS_APPEAR, () => this.checkShouldStartNegotiation())
        this.registerListener(Evt.TROLL_LOCATION_CHANGED, (str) => this.checkShouldStartNegotiation())

        o_.troll.setLocation(TrollLocation.BRIDGE);
        o_.camera.panToBridge()
        this.trollGoesToBridge(this.initialDestination)

        o_.items.getAllNonCombat().forEach(i => i.setInteractive(true))

        o_.characters.allTravelersGoAcrossBridge()

        this.checkShouldStartNegotiation()
    }

    onEnd() {
        this.interfaceFor.cleanup()
        o_.items.getAllNonCombat().forEach(i => i.setInteractive(false))
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
            o_.lair.setInteractive.surfaceOnly()

            o_.bridge.setInteractive.all(false)
            o_.bridge.setInteractive.surface(true)
        },
        goesToLair: () => {
            o_.lair.setInteractive.surfaceOnly()

            o_.bridge.setInteractive.all(false)
            o_.bridge.setInteractive.surface(true)
        },
        cleanup: () => {
            o_.lair.setInteractive.all(false)
            o_.bridge.setInteractive.all(false)
        },
        climbToLair: () => {
            o_.lair.setInteractive.all(false)
            o_.bridge.setInteractive.all(false)
            o_.bridge.setInteractive.surface(true)
        },
        climbsFromLair: () => {
            o_.lair.setInteractive.surfaceOnly()
            o_.bridge.setInteractive.all(false)
        },
    }

    trollGoesToBridge = async (coord: Vec) => {
        if (o_.troll.currentStateKey === TrollStateKey.CLIMB) {
            let resPromise = this.setCurrentTrollActivity(() => o_.troll.climbLadder('up'))
            this.interfaceFor.climbsFromLair()
            const res = await resPromise
            if (res === CANCELLED) return
        }

        const resPromise = this.setCurrentTrollActivity(() => o_.troll.goToBridge({coord}))
        this.interfaceFor.idleOnBridge()
        const res = await resPromise
        if (res === CANCELLED) return
    }

    trollGoesToLair = async (coord: Vec) => {
        o_.camera.panToLair()

        if (o_.troll.currentStateKey !== TrollStateKey.CLIMB) {
            this.interfaceFor.goesToLair();

            const res = await this.setCurrentTrollActivity(() => o_.troll.goToLadder('closest'));

            if (res === CANCELLED) {
                o_.camera.panToBridge()
                return
            }
        }

        let resPromise = this.setCurrentTrollActivity(() => o_.troll.climbLadder('down'))
        this.interfaceFor.climbToLair()
        const res = await resPromise
        if (res === CANCELLED) {
            o_.camera.panToBridge()
            return
        }

        this.goToNextPhase(new PhaseLair())
    }

    checkShouldStartNegotiation() {
        if (
            o_.troll.location === TrollLocation.BRIDGE &&
            o_.characters.getNewTravellers().length
        ) {
            this.goToNextPhase(new PhaseNegotiations())
        }
    }
}