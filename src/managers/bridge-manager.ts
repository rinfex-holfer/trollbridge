import {resoursePaths} from "../resourse-paths";
import {render} from "./render";
import {trollManager} from "./troll-manager";
import {eventBus, Evt} from "../event-bus";
import {Container} from "../type-aliases";
import {positioner} from "./positioner";
import {TrollLocation} from "../types";

class BridgeManager {
    static CONTAINER_ID = 'bridge'

    // @ts-ignore
    container: Container

    init() {
        const container = render.createContainer(BridgeManager.CONTAINER_ID)
        this.container = container;

        render.createTiles({
            paths: [resoursePaths.images.floor],
            ...positioner.bridgePosition(),
            container,
            entityId: 'bridge',
        })

        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', () => trollManager.goToBridge())

        // eventBus.on(Evt.ENCOUNTER_ENDED, () => {
        //     if (trollManager.location !== TrollLocation.BRIDGE) this.enableInterface()
        // })
        eventBus.on(Evt.ENCOUNTER_STARTED, () => this.disableInterface())
        eventBus.on(Evt.TROLL_LOCATION_CHANGED, l => this.onTrollLocationChanged(l))
    }

    enableInterface() {
        this.container.interactive = true;
        this.container.buttonMode = true;
    }

    disableInterface() {
        this.container.interactive = false;
        this.container.buttonMode = false;
    }

    onTrollLocationChanged(loc: TrollLocation) {
        if (loc === TrollLocation.BRIDGE) {
            this.disableInterface()
        } else {
            this.enableInterface()
        }
    }
}

export const bridgeManager = new BridgeManager();