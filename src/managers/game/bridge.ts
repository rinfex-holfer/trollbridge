import {positioner} from "./positioner";
import {TrollLocation} from "../../types";
import {Tiles} from "../core/render/tiles";
import {o_} from "../locator";
import {Rock} from "../../entities/rock";
import {Rect, sortByDistance, Vec} from "../../utils/utils-math";
import {EntityType} from "../core/entities";
import {O_Sprite} from "../core/render/sprite";
import {gameConstants} from "../../constants";
import {UpgradeButton} from "../../interface/upgrade-button";

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

        this.createRockPlaces()
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

    private rockPlaces: RockPlace[] = []
    
    createRockPlaces() {
        const coords = [
            [this.pos.x + this.pos.width / 2 + 50, this.pos.y + 50],
            [this.pos.x + this.pos.width / 2 - 100, this.pos.y + 100],
            [this.pos.x + this.pos.width / 2 - 30, this.pos.y + this.pos.height - 70],
        ]

        coords.forEach(c => this.rockPlaces.push(new RockPlace(c[0], c[1])))
    }

    getRockPlaces() {
        return this.rockPlaces
    }

    getClosestRockPlace(pos: Vec) {
        const places = this.rockPlaces.filter(p => !p.isRuined)
        const sortedPlaces = sortByDistance(places, pos)
        return sortedPlaces[0]
    }
}

class RockPlace {
    x: number
    y: number
    crackSprite: O_Sprite
    
    isRuined = false

    btn: UpgradeButton | undefined

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.crackSprite = new O_Sprite(o_.game.getScene(), 'bridge_crack', x, y)
        this.crackSprite.setVisibility(false)
    }

    createUpgradeButton(pos: Vec) {
        this.btn = o_.upgrade.createUpgradeButton(pos, 'Починить мостовую', gameConstants.costs.fix_bridge, () => {
            this.repair()
        })
    }

    repair() {
        this.crackSprite.setVisibility(false)
        this.isRuined = false
    }

    ruin(withAnimation?: boolean) {
        this.crackSprite.setVisibility(true)
        this.isRuined = true
        this.createUpgradeButton({x: this.x, y: this.y})
    }
}