import {positioner} from "./positioner";
import {TrollLocation} from "../../types";
import {Tiles} from "../core/render/tiles";
import {o_} from "../locator";
import {Rock} from "../../entities/rock";
import {Rect} from "../../utils/utils-math";
import {EntityType} from "../core/entities";

export class BridgeManager {
    sprite: Tiles

    pos: Rect

    constructor() {
        this.pos = positioner.bridgePosition();
        this.sprite = o_.render.createTiles('floor', this.pos.x, this.pos.y, this.pos.width, this.pos.height);
        this.sprite.setOrigin(0, 0);

        this.enableInterface();
        this.sprite.onClick(() => o_.troll.goToBridge())

        o_.register.bridge(this);

        this.createRocks()
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

    createRocks() {
        const pos = {x: 0, y: 0}
        pos.x = this.pos.x + this.pos.width / 2 - 30
        pos.y = this.pos.y + 20
        new Rock(pos)
    }

    getRocks() {
        return o_.entities.get(EntityType.ROCK)
    }
}