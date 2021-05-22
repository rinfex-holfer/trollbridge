import {positioner} from "./positioner";
import {TrollLocation} from "../../types";
import {stub} from "../../utils/utils-misc";
import {Tiles} from "../core/render/tiles";
import {o_} from "../locator";

export class BridgeManager {
    sprite: Tiles

    trollLocation: TrollLocation = TrollLocation.LAIR

    constructor() {
        const bridgePos = positioner.bridgePosition();
        this.sprite = o_.render.createTiles('floor', bridgePos.x, bridgePos.y, bridgePos.width, bridgePos.height);
        this.sprite.setOrigin(0, 0);

        this.enableInterface();
        this.sprite.onClick(() => this.onClick())

        o_.register.bridge(this);
    }

    onClick: (() => void) = stub

    enableInterface() {
        this.sprite.setInteractive(true, {cursor: 'pointer'});
    }

    disableInterface() {
        this.sprite.setInteractive(false);
    }
}