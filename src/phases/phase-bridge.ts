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
import {ItemType} from "../entities/items/types";
import {Meat} from "../entities/items/meat/meat";

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

        this.onNewItems({
            [ItemType.MEAT]: (item: Meat) => item.setInteractive(true),
            [ItemType.GOLD]: (item: Meat) => item.setInteractive(true),
        })

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
        jumpToLair: () => {
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
        // if (o_.troll.currentStateKey === TrollStateKey.CLIMB) {
        //     let resPromise = this.setCurrentTrollActivity(() => o_.troll.climbLadder('up'))
        //     this.interfaceFor.climbsFromLair()
        //     const res = await resPromise
        //     if (res === CANCELLED) return
        // }

        const resPromise = this.setCurrentTrollActivity(() => o_.troll.goToBridge({coord}))
        this.interfaceFor.idleOnBridge()
        const res = await resPromise
        if (res === CANCELLED) return
    }

    ignoresTravellers = false
    trollGoesToLair = async (coord: Vec) => {
        this.ignoresTravellers = true
        o_.camera.panToLair()

        this.interfaceFor.goesToLair();

        const res2 = await this.setCurrentTrollActivity(() => o_.troll.goToJumpPointFromBridge(coord));
        if (res2 === "CANCELLED") {
            o_.camera.panToLair()
            this.ignoresTravellers = false
            return
        }

        let resPromise = this.setCurrentTrollActivity(() => o_.troll.jumpToLair(coord))
        this.interfaceFor.jumpToLair()
        const res = await resPromise
        if (res === CANCELLED) {
            o_.camera.panToBridge()
            this.ignoresTravellers = false
            return
        }

        this.goToNextPhase(new PhaseLair())
    }

    onUpdate() {
        this.checkShouldStartNegotiation()
    }

    travellersWalkedAwayIds = ''

    checkShouldStartNegotiation() {
        if (this.ignoresTravellers) return

        const newTravellers = o_.characters.getNewTravellers();
        const travellersId = newTravellers.map(t => t.id).join(', ');
        if (o_.characters.getNewTravellers().length) {
            if (o_.characters.canTravellersWalkAwayLol()) {
                if (travellersId !== this.travellersWalkedAwayIds) {
                    // don't send loling twice
                    o_.characters.allTravelersWalkAwayLol()
                    this.travellersWalkedAwayIds = travellersId
                }
            } else {
                this.goToNextPhase(new PhaseNegotiations())
            }
        }
    }
}