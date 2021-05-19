import {TileSprite} from "./render";
import {eventBus, Evt} from "../event-bus";
import {positioner} from "./positioner";
import {TrollLocation} from "../types";
import {stub} from "../utils/utils-misc";

class BridgeManager {
    // @ts-ignore
    sprite: TileSprite

    trollLocation: TrollLocation = TrollLocation.LAIR

    init() {
        const bridgePos = positioner.bridgePosition();
        this.sprite = new TileSprite('floor', bridgePos.x, bridgePos.y, bridgePos.width, bridgePos.height);
        this.sprite.setOrigin(0, 0);

        this.enableInterface();
        this.sprite.onClick(() => this.onClick())
    }

    onClick: (() => void) = stub

    enableInterface() {
        this.sprite.setInteractive(true, {cursor: 'pointer'});
    }

    disableInterface() {
        this.sprite.setInteractive(false);
    }
}

export const bridgeManager = new BridgeManager();