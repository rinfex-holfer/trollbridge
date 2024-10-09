import {O_Text} from "../../managers/core/render/text";
import {eventBus, eventBusSubscriptions, Evt} from "../../event-bus";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {colorsCSS} from "../../configs/constants";
import {O_Sprite} from "../../managers/core/render/sprite";
import {Gold, GOLD_WIDTH, GoldLocation} from "../items/gold";
import {flyingStatusChange} from "../../interface/basic/flying-status-change";
import {SOUND_KEY} from "../../managers/core/audio";
import {goldConfig} from "../../configs/gold-config";
import {createId, debugExpose} from "../../utils/utils-misc";
import {ItemType} from "../items/types";
import {PotData} from "./pot";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";
import {positioner} from "../../managers/game/positioner";
import {Txt} from "../../translations";

export type TreasuryData = {
    id: string,
    cmp: {
        upgradable: UpgradableComponentData
        treasury: {
            amount: number
        }
    }
}

export class Treasury {
    text: O_Text
    sprite: O_Sprite

    subs = eventBusSubscriptions()

    id: string
    cmp: {
        upgradable: UpgradableComponent
        treasury: {
            amount: number
        }
    }

    constructor(props?: TreasuryData) {
        const position = positioner.getTreasuryPosition()
        this.sprite = o_.render.createSprite('treasury', position.x, position.y)
        this.sprite.setOrigin(0, 0.5)
        this.sprite.setWidth(300, false)
        this.sprite.setHeight(100, false)

        this.sprite.setInteractive(true)
        // this.sprite.onClick(() => this.addGold(10))
        // this.sprite.onRightClick(() => this.removeGold(10))
        this.sprite.onPointerOver(() => this.onPointerOver())
        this.sprite.onPointerOut(() => this.onPointerOut())

        this.text = o_.render.createText({
            textKey: 'Золото: ' + this.amount,
            x: this.sprite.x + 50,
            y: this.sprite.y - 40,
            style: {color: colorsCSS.WHITE}
        })
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_BUTTONS)

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.id = props?.id || createId('treasury')

        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {x: this.sprite.x, y: this.sprite.y},
                titleTextKey: Txt.UpgradePotTitle,
                descriptionTextKey: Txt.UpgradePotDescr,
                getUpgradeCost: this.getUpgradeCost,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level: 0,
                ...props?.cmp?.upgradable,
            }),
            treasury: {
                amount: 0,
                ...props?.cmp?.treasury
            }
        }

        this.onGoldChanged()

        debugExpose((amount: number) => this.addGold(amount), 'addGold')
    }

    getUpgradeCost = () => goldConfig.costs.treasury
    _canBeUpgraded = () => false
    _upgrade = () => null

    getData(): PotData {
        return {}
    }

    private onTimePassed() {

    }

    textShowTimeout: any

    showText() {
        this.text.setVisibility(true)
        // clearTimeout(this.textShowTimeout)
        // this.textShowTimeout = setTimeout(() => this.text.setVisibility(false), 3000)
    }

    hideText() {
        this.text.setVisibility(false)
        clearTimeout(this.textShowTimeout)
    }

    onPointerOver() {
        this.showText()
    }

    onPointerOut() {
        this.hideText()
    }

    private setState() {

    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        this.addGold(10)
    }

    onGoldChanged() {
        this.amount = this.gold.reduce((acc, g) => acc + g.data.amount, 0)
        this.text.setText('Золото: ' + this.amount)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    public async gatherGold(gold: Gold[]) {
        let amount = 0
        await Promise.all(gold.map(g => {
            amount += g.data.amount
            return g.flyToStorage()
        }))
        this.addGold(amount)
    }

    addGold(amount: number) {
        o_.audio.playSound(SOUND_KEY.PICK_BIG)
        this.flyingNumbers('+ ' + amount + ' gold')

        const goldEntity = this.gold[this.gold.length - 1];
        if (goldEntity && goldEntity.data.amount < goldConfig.MAX_GOLD_IN_SPRITE) {
            const addAmount = Math.min(amount, goldConfig.MAX_GOLD_IN_SPRITE - goldEntity.data.amount)
            goldEntity.setAmount(goldEntity.data.amount + addAmount)
            amount -= addAmount;
        }

        while (amount > 0) {
            const amountToAdd = Math.min(amount, goldConfig.MAX_GOLD_IN_SPRITE)
            this.gold.push(new Gold({
                position: this.getNextPosition(),
                location: GoldLocation.TREASURY,
                amount: amountToAdd,
            }))
            amount -= amountToAdd
        }

        this.onGoldChanged()
    }

    numbersQueue: string[] = []

    private flyingNumbers(val: string) {


        this.numbersQueue.push(val)

        if (this.timer) return
        else this.nextNumbers()
    }

    timer: any

    nextNumbers() {
        const p = this.numbersQueue.shift()
        if (!p) {
            this.timer = null
            return
        }
        let x = this.sprite.x
        let y = this.sprite.y - 20
        flyingStatusChange(p, x, y, colorsCSS.YELLOW)

        this.timer = setTimeout(() => {
            this.nextNumbers()
        }, 300)
    }

    removeGold(amount: number) {
        flyingStatusChange('- ' + amount + ' gold', this.sprite.x, this.sprite.y - 20, colorsCSS.RED)
        while (amount > 0) {
            if (this.gold.length === 0) {
                console.error('cant spend more gold that treasure has')
                break;
            }

            const goldEntity = this.gold[this.gold.length - 1];
            const removeAmount = Math.min(amount, goldEntity.data.amount)
            if (removeAmount === goldEntity.data.amount) {
                goldEntity.destroy()
                this.gold.pop()
            } else {
                goldEntity.setAmount(goldEntity.data.amount - removeAmount)
            }
            amount -= removeAmount
        }

        this.onGoldChanged()
    }
}