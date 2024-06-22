import {o_} from "../managers/locator";
import {TrollLocation} from "../types";
import {Evt} from "../event-bus";
import {CancellablePromise, CANCELLED, createCancellablePromise} from "../utils/utils-async";
import {GamePhase} from "./game-phase";
import {PotState} from "../entities/buildings/pot";
import {PhaseMakeFood} from "./phase-make-food";
import {PhaseBuild} from "./phase-build";
import {PhaseBridge} from "./phase-bridge";
import {TrollStateKey} from "../managers/game/troll/troll-state";
import {Vec} from "../utils/utils-math";
import {GamePointerEvent} from "../managers/core/input/types";

export class PhaseLair extends GamePhase {

    name = "lair"

    activity?: {
        promise: CancellablePromise,
        cancel: () => void,
    }

    initialCoord?: Vec

    constructor(coord?: Vec) {
        super();
        this.initialCoord = coord
    }

    onStart() {
        this.registerListener(Evt.INTERFACE_BED_CLICKED, this.trollGoesToBed)
        this.registerListener(Evt.INTERFACE_CHAIR_CLICKED, this.onChairClicked)
        this.registerListener(Evt.INTERFACE_POT_CLICKED, this.onPotClicked)
        this.registerListener(Evt.INTERFACE_TOOLS_CLICKED, this.onToolsClicked)
        this.registerListener(Evt.INTERFACE_LAIR_CLICKED, (e) => this.onLairClicked(e.event))
        this.registerListener(Evt.INTERFACE_BRIDGE_CLICKED, (e) => this.trollGoesToBridge({coord: e.event}))

        o_.troll.setLocation(TrollLocation.LAIR)
        o_.camera.panToLair()
        this.interfaceFor.idleInLair()

        if (this.initialCoord) {
            this.trollGoesToLair(this.initialCoord)
        }
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
        idleInLair: () => {
            o_.lair.setInteractive.all(true)
            o_.bridge.setInteractive.all(true)
        },
        goesToBed: () => {
            o_.lair.setInteractive.all(true)
            o_.bridge.setInteractive.all(true)
        },
        goesToSit: () => {
            o_.lair.setInteractive.all(true)
            o_.bridge.setInteractive.surfaceOnly()
        },
        sit: () => {
            o_.lair.setInteractive.all(true)
            o_.bridge.setInteractive.surfaceOnly()
        },
        sleepOnBed: () => {
            o_.lair.setInteractive.all(true)
            o_.bridge.setInteractive.surfaceOnly()
        },
        cleanup: () => {
            o_.lair.setInteractive.all(false)
            o_.bridge.setInteractive.all(false)
        },
        goesToBridge: () => {
            o_.lair.setInteractive.allButComplexStuff()
            o_.bridge.setInteractive.surfaceOnly()
        },
        climbsToBridge: () => {
            o_.lair.setInteractive.allButComplexStuff()
            o_.bridge.setInteractive.surfaceOnly()
        },
        climbsFromBridge: () => {
            o_.lair.setInteractive.allButComplexStuff()
            o_.bridge.setInteractive.surfaceOnly()
        }
    }

    onToolsClicked = () => {
        this.goToNextPhase(new PhaseBuild())
    }

    onLairClicked = async (e: GamePointerEvent) => {
        if (o_.troll.currentStateKey === TrollStateKey.CLIMB) {
            let resPromise = this.setCurrentTrollActivity(() => o_.troll.climbLadder('down'))
            this.interfaceFor.climbsFromBridge()
            const res = await resPromise
            if (res === CANCELLED) return
        }
        let resPromise = this.setCurrentTrollActivity(() => o_.troll.goToLair(e))
        this.interfaceFor.idleInLair()
        const res = await resPromise
        if (res === CANCELLED) return
    }

    onChairClicked = () => {
        switch (o_.troll.state.key) {
            case TrollStateKey.SIT:
                this.trollSit()
                o_.time.wait()
                break;
            default:
                this.trollGoesToSit();
                break;
        }
    }

    onPotClicked = (potState: PotState) => {
        switch (potState) {
            case PotState.EMPTY:
                if (PhaseMakeFood.checkCanBeStarted()) {
                    this.goToNextPhase(new PhaseMakeFood())
                }
                break;
            case PotState.PREPARING:
                break;
            case PotState.READY:
                o_.lair.pot.eat()
                break;
        }
    }

    trollGoesToLair = async (coord: Vec) => {
        this.setCurrentTrollActivity(() => o_.troll.goToLair(coord));
    }

    trollGoesToBridge = async (options: {
        coord: Vec
    }) => {

        // TODO - back from bridge + fix дерганье на мосту

        o_.camera.panToBridge()

        if (o_.troll.currentStateKey !== TrollStateKey.CLIMB) {
            this.interfaceFor.goesToBridge();

            const res = await this.setCurrentTrollActivity(() => o_.troll.goToLadder());
            if (res === "CANCELLED") {
                o_.camera.panToLair()
                return
            }
        }

        let resPromise = this.setCurrentTrollActivity(() => o_.troll.climbLadder('up'))
        this.interfaceFor.climbsToBridge()
        const res = await resPromise
        if (res === CANCELLED) {
            o_.camera.panToLair()
            return
        }

        this.goToNextPhase(new PhaseBridge(options))
    }

    trollGoesToBed = async () => {
        this.interfaceFor.goesToBed()

        const res = await this.setCurrentTrollActivity(o_.troll.goToBed)
        if (res === CANCELLED) return

        this.interfaceFor.sleepOnBed()
        o_.troll.goSleep()
    }

    trollGoesToSit = async () => {
        this.interfaceFor.goesToSit()

        const res = await this.setCurrentTrollActivity(o_.troll.goToSit)
        if (res === CANCELLED) return

        this.trollSit()
    }

    trollSit = () => {
        this.interfaceFor.sit()
        o_.troll.sit()
    }
}