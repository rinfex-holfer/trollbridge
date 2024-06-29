import {positioner} from "./positioner";
import {O_Tiles} from "../core/render/tiles";
import {o_} from "../locator";
import {Rect, rnd, sortByDistance, Vec} from "../../utils/utils-math";
import {O_Sprite} from "../core/render/sprite";
import {UpgradeButton} from "../../interface/upgrade-button";
import {goldConfig} from "../../configs/gold-config";
import {getGameSize} from "../../utils/utils-misc";
import {eventBus, Evt} from "../../event-bus";
import {Txt} from "../core/texts";
import {CursorType} from "../core/input/cursor";

export class BridgeManager {
    sprite: O_Tiles

    pos: Rect

    // shakePosition: any

    isWithStatues = false

    constructor() {
        this.pos = positioner.getBridgePosition();
        this.sprite = o_.render.createTiles('floor', this.pos.x, this.pos.y, this.pos.width, this.pos.height);
        this.sprite.setOrigin(0, 0);
        // this.sprite.obj.alpha = 0;

        this.setInteractive.all(true);

        this.sprite.onClick((e) => {
            eventBus.emit(Evt.INTERFACE_BRIDGE_CLICKED, {event: e})
        })

        o_.register.bridge(this);

        this.createRockPlaces()
        // this.rockPlaces.forEach(p => p.ruin(false))

        // @ts-ignore
        // this.shakePosition = o_.game.getScene().plugins.get('rexshakepositionplugin').add(this.sprite.obj);

        // o_.upgrade.createUpgradeButton({
        //     x: this.pos.x + this.pos.width - 100,
        //     y: this.pos.y + 350
        // }, o_.texts.t(Txt.UpgradeBridge), goldConfig.costs.bridge_ornament, () => this.createStatues())
    }

    setInteractive = {
        all: (val: boolean) => {
            this.setInteractive.surface(val)
        },
        surface: (val: boolean) => this.sprite.setInteractive(val),

        surfaceOnly: () => {
            this.setInteractive.all(false)
            this.setInteractive.surface(true)
        },
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
        if (ruined >= 4) this.shake()
    }

    checkDestruction(): boolean {
        const ruined = this.getRockPlaces().filter(r => r.isRuined).length
        if (ruined === 6) {
            // this.fall()
            // return true
        }

        return false;
    }

    shake() {
        // TODO
        // this.shakePosition.shake()
    }

    fall() {
        this.shake()
        const gameSize = getGameSize()
        o_.render.moveTo(this.sprite, {x: 0, y: gameSize.height + 100}, 300).promise.then(() => {
            o_.game.gameOver('Мост рухнул!')
        })
    }

    createStatues() {
        const options = {width: 100, height: 100}
        o_.render.createSprite('statue', this.pos.x + 100, this.pos.y + 10, options)
        o_.render.createSprite('statue', this.pos.x + 100, this.pos.y + this.pos.height - 60, options)

        const right1 = o_.render.createSprite('statue', this.pos.x + this.pos.width - 100, this.pos.y + 10, options)
        const right2 = o_.render.createSprite('statue', this.pos.x + this.pos.width - 100, this.pos.y + this.pos.height - 60, options)
        right1.flipX()
        right2.flipX()

        this.isWithStatues = true
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
        // this.btn = o_.upgrade.createUpgradeButton(pos, 'Починить мостовую', goldConfig.costs.fix_bridge, () => {
        //     this.repair()
        // })
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