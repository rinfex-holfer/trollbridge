import {positioner} from "./positioner";
import {TrollLocation} from "../../types";
import {stub} from "../../utils/utils-misc";
import {Tiles} from "../core/render/tiles";
import {o_} from "../locator";

export class BridgeManager {
    sprite: Tiles

    constructor() {
        const bridgePos = positioner.bridgePosition();
        this.sprite = o_.render.createTiles('floor', bridgePos.x, bridgePos.y, bridgePos.width, bridgePos.height);
        this.sprite.setOrigin(0, 0);

        this.enableInterface();
        this.sprite.onClick(() => o_.troll.goToBridge())

        o_.register.bridge(this);
    }

    enableInterface() {
        this.sprite.setInteractive(true, {cursor: 'pointer'});
    }

    disableInterface() {
        this.sprite.setInteractive(false);
    }

    updateMayBeMovedInto() {
        if (o_.troll.location === TrollLocation.BRIDGE) this.disableInterface()
        else this.enableInterface()
    }
}