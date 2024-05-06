import {o_} from "../managers/locator";
import {TrollLocation} from "../types";
import {eventBus, Evt} from "../event-bus";
import {createPromiseAndHandlers} from "../utils/utils-async";
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

export class PhaseLair extends GamePhase {

    activity?: {
        promise: Promise<TrollActivityInLair>,
        cancel: (canceledWithActivity: TrollActivityInLair) => void,
        done: (activity: TrollActivityInLair) => void
    }

    onStart() {
        this.onTrollCameToLair()
        this.registerListener(Evt.INTERFACE_BED_CLICKED, this.onBedClicked)
        this.registerListener(Evt.INTERFACE_POT_CLICKED, this.onPotClicked)
        this.registerListener(Evt.INTERFACE_OPEN_BUILD_MENU_BUTTON_CLICKED, this.onBuildMenuClicked)
    }

    onEnd() {
        o_.lair.setObjectsActive(false)
        o_.lair.setMenuShown(false)
    }

    setCurrentTrollActivity(activityPromise: Promise<any>, activityType: TrollActivityInLair) {
        if (this.activity) {
            this.activity.cancel(activityType)
        }

        const {promise, fail, done} = createPromiseAndHandlers<TrollActivityInLair>()

        activityPromise.then(() => {
            done(activityType)
        })

        this.activity = {
            promise,
            cancel: fail,
            done
        }

        return activityPromise;
    }

    onTrollCameToLair() {
        console.log("======== onTrollCameToLair")
        o_.troll.setLocation(TrollLocation.LAIR);

        o_.lair.setObjectsActive(true)
        o_.lair.setClickable(false)
        o_.lair.setMenuShown(true)
        o_.bridge.enableInterface()

        eventBus.once(Evt.INTERFACE_BRIDGE_CLICKED, this.onBridgeClicked)

        o_.camera.panToLair()

        this.trollGoesToChillZone()
    }

    onBedClicked = async () => {
        this.trollGoesToBed()
    }

    onBridgeClicked = () => {
        this.trollGoesToBridge()
    }

    onBuildMenuClicked = () => {
        this.goToNextPhase(new PhaseBuild())
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

    async trollGoesToChillZone() {
        return this.setCurrentTrollActivity(o_.troll.goToLairChillZone(), Activity.GO_TO_CHILL_ZONE);
    }

    async trollGoesToBridge() {
        o_.lair.setObjectsActive(false)
        o_.lair.setMenuShown(false)
        o_.bridge.disableInterface()
        o_.camera.panToBridge()

        o_.lair.setClickable(true)

        // const {promise: lairClickedPromise, done: onLairClicked} = createPromiseAndHandlers<typeof BACK_TO_LAIR>()
        const evtId = eventBus.once(Evt.INTERFACE_LAIR_CLICKED, () => {
            this.onTrollCameToLair();
        })

        await this.setCurrentTrollActivity(o_.troll.goToLadderBottom(), Activity.GO_TO_STAIRS);
        eventBus.unsubscribe(Evt.INTERFACE_LAIR_CLICKED, evtId)

        // TODO climb stairs
    }

    async trollGoesToBed() {
        o_.lair.setClickable(false)
        o_.bridge.enableInterface();
        await this.setCurrentTrollActivity(await o_.troll.goToBed(), Activity.GO_TO_BED)
        o_.troll.goSleep()
    }
}