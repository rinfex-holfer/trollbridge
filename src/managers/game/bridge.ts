import {positioner} from "./positioner";
import {TrollLocation} from "../../types";
import {O_Tiles} from "../core/render/tiles";
import {o_} from "../locator";
import {Rect, rnd, sortByDistance, Vec} from "../../utils/utils-math";
import {O_Sprite} from "../core/render/sprite";
import {UpgradeButton} from "../../interface/upgrade-button";
import {goldConfig} from "../../configs/gold-config";
import {gameConstants} from "../../configs/constants";
import {getGameSize} from "../../utils/utils-misc";

export class BridgeManager {
    sprite: O_Tiles

    pos: Rect

    shakePosition: any

    constructor() {
        this.pos = positioner.bridgePosition();
        this.sprite = o_.render.createTiles('floor', this.pos.x, this.pos.y, this.pos.width, this.pos.height);
        this.sprite.setOrigin(0, 0);
        this.sprite.addPhysics()

        this.enableInterface();
        this.sprite.onClick(() => o_.troll.goToBridge())

        o_.register.bridge(this);

        this.createRockPlaces()
        // this.rockPlaces.forEach(p => p.ruin(false))

        // @ts-ignore
        this.shakePosition = o_.game.getScene().plugins.get('rexshakepositionplugin').add(this.sprite.obj);
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
            [this.pos.x + this.pos.width / 2 - 200, this.pos.y + 120],
            [this.pos.x + this.pos.width / 2 - 30, this.pos.y + this.pos.height - 70],
            [this.pos.x + this.pos.width / 2 - 130, this.pos.y + this.pos.height - 70],
            [this.pos.x + this.pos.width / 2 - 230, this.pos.y + this.pos.height - 70],
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

    getHasAvailableRocks() {
        return this.getRockPlaces().some(p => !p.isRuined)
    }

    onRuined() {
        const ruined = this.getRockPlaces().filter(r => r.isRuined).length
        if (ruined >= gameConstants.BRIDGE_HOLES[0][0]) this.shake()
    }

    checkDestruction(): boolean {
        const ruined = this.getRockPlaces().filter(r => r.isRuined).length
        if (ruined > gameConstants.BRIDGE_HOLES[0][0]) {
            for (let i = 1; i < gameConstants.BRIDGE_HOLES.length; i++) {
                if (ruined === gameConstants.BRIDGE_HOLES[i][0]) {
                    if (rnd() < gameConstants.BRIDGE_HOLES[i][1]) {
                        this.fall()
                        return true
                    }
                    return false;
                }
            }
            this.fall()
            return true
        }

        return false;
    }

    shake() {
        this.shakePosition.shake()
    }

    fall() {
        this.shake()
        o_.interaction.disableEverything()
        const gameSize = getGameSize()
        o_.render.moveTo(this.sprite, {x: 0, y: gameSize.height + 100}, 300).promise.then(() => {
            o_.game.gameOver('Мост рухнул!')
        })
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
        this.btn = o_.upgrade.createUpgradeButton(pos, 'Починить мостовую', goldConfig.costs.fix_bridge, () => {
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

        if (withAnimation) o_.bridge.onRuined()
    }
}