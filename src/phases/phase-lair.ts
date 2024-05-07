import {o_} from "../managers/locator";
import {TrollLocation} from "../types";
import {eventBus, Evt} from "../event-bus";
import {CancellablePromise, CANCELLED, createCancellablePromise, createPromiseAndHandlers} from "../utils/utils-async";
import {GamePhase} from "./game-phase";
import {PotState} from "../entities/buildings/pot";
import {PhaseMakeFood} from "./phase-make-food";
import {PhaseBuild} from "./phase-build";

const Activity = {
    GO_TO_BED: "GO_TO_BED",
    GO_TO_BRIDGE: "GO_TO_BRIDGE",
    GO_TO_STAIRS: "GO_TO_STAIRS",
    GO_TO_CHILL_ZONE: "GO_TO_CHILL_ZONE"
} as const
type TrollActivityInLair = typeof Activity[keyof typeof Activity]

enum ActivityResult {
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
}

export class PhaseLair extends GamePhase {

    activity?: {
        promise: CancellablePromise,
        cancel: () => void,
    }

    onStart() {
        this.registerListener(Evt.INTERFACE_BED_CLICKED, this.trollGoesToBed)
        this.registerListener(Evt.INTERFACE_POT_CLICKED, this.onPotClicked)
        this.registerListener(Evt.INTERFACE_OPEN_BUILD_MENU_BUTTON_CLICKED, this.onBuildMenuClicked)
        this.registerListener(Evt.INTERFACE_LAIR_CLICKED, this.onLairClicked)
        this.registerListener(Evt.INTERFACE_BRIDGE_CLICKED, this.trollGoesToBridge)

        o_.troll.setLocation(TrollLocation.LAIR);
        o_.camera.panToLair()
        this.interfaceFor.idleInLair()
        this.trollGoesToChillZone()
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
            o_.lair.setObjectsActive(true)
            o_.lair.setClickable(false)
            o_.lair.setMenuShown(true)
            o_.bridge.enableInterface()
        },
        goesToBed: () => {
            o_.lair.setClickable(true)
            o_.lair.setObjectsActive(false)
            o_.lair.setMenuShown(false)
            o_.bridge.enableInterface();
        },
        sleepOnBed: () => {
            o_.lair.setClickable(true)
            o_.lair.setObjectsActive(false)
            o_.lair.bed.setEnabled(true)
            o_.lair.setMenuShown(false)
            o_.bridge.disableInterface();
        },
        cleanup: () => {
            o_.lair.setObjectsActive(false)
            o_.lair.setClickable(false)
            o_.lair.setMenuShown(false)
            o_.bridge.disableInterface()
        },
        goesToBridge: () => {
            o_.lair.setObjectsActive(false)
            o_.lair.setMenuShown(false)
            o_.lair.setClickable(true)
            o_.bridge.disableInterface()
        }
    }

    onBuildMenuClicked = () => {
        this.goToNextPhase(new PhaseBuild())
    }

    onLairClicked = async () => {
        const resPromise = this.setCurrentTrollActivity(o_.troll.goToLairChillZone)
        this.interfaceFor.idleInLair()
        const res = await resPromise
        if (res === CANCELLED) return
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

    trollGoesToChillZone = async () => {
        this.setCurrentTrollActivity(o_.troll.goToLairChillZone);
    }

    trollGoesToBridge = async () => {
        this.interfaceFor.goesToBridge();
        o_.camera.panToBridge()

        const res = await this.setCurrentTrollActivity(o_.troll.goToLadderBottom);

        if (res === "CANCELLED") {
            o_.camera.panToLair()
            return
        }

        // TODO climb stairs
    }

    trollGoesToBed = async () => {
        this.interfaceFor.goesToBed()

        const res = await this.setCurrentTrollActivity(o_.troll.goToBed)
        if (res === CANCELLED) return

        this.interfaceFor.sleepOnBed()
        o_.troll.goSleep()
    }
}