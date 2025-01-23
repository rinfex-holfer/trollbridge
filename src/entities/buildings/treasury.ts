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
import {o_logger} from "../../utils/logger";
import {SpriteKey} from "../../resourse-paths";

const MAX_LEVEL = 2;

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
    goldSprite: O_Sprite

    subs = eventBusSubscriptions()

    id: string
    cmp: {
        upgradable: UpgradableComponent
        treasury: {
            amount: number
        }
    }

    isDestroyed = false

    constructor(props?: TreasuryData) {
        const position = positioner.getTreasuryPosition()
        this.sprite = o_.render.createSprite(this.getSpriteKey(), position.x, position.y)
        this.sprite.setOrigin(0, 0.5)
        this.sprite.setWidth(100, false)
        this.sprite.setHeight(100, false)

        this.sprite.setInteractive(true)
        this.sprite.onPointerOver(() => this.onPointerOver())
        this.sprite.onPointerOut(() => this.onPointerOut())

        this.text = o_.render.createText({
            textKey: 'Золото: ',
            x: this.sprite.x + 50,
            y: this.sprite.y - 60,
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
                titleTextKey: Txt.UpgradeTreasuryTitle,
                descriptionTextKey: Txt.UpgradeTreasuryDescr,
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
        this.cmp.upgradable.init()

        this.goldSprite = o_.render.createSprite(this.getGoldSpriteKey(), this.sprite.x + 50, this.sprite.y)
        this.goldSprite.setWidth(GOLD_WIDTH)

        this.onGoldChanged()

        debugExpose((amount: number) => this.addGold(amount), 'addGold')
    }

    getUpgradeCost = () => {
        return goldConfig.costs.treasury[this.cmp.upgradable.level]
    }

    _canBeUpgraded = () => {
        // console.log('can be upgraded', this.cmp.upgradable.level < MAX_LEVEL, this.cmp.upgradable.level, MAX_LEVEL)
        return this.cmp.upgradable.level < MAX_LEVEL
    }

    _upgrade = () => {
        if (!this.cmp.upgradable.canBeUpgraded()) {
            o_logger.error("bed can't be upgraded, already max level")
            return;
        }
        this.cmp.upgradable.level++

        this.sprite.setTexture(this.getSpriteKey())
    }

    private getSpriteKey(): SpriteKey {
        const level = this.cmp?.upgradable?.level || 0;
        switch (level) {
            case 0:
                return 'treasury_0'
            case 1:
                return 'treasury_1'
            case MAX_LEVEL: // 2
                return 'treasury_2'
            default:
                throw Error("wrong treasury level: " + level)
        }
    }

    private getGoldSpriteKey(): SpriteKey {
        if (this.cmp.treasury.amount === 0) {
            return "empty_sprite"
        }

        if (this.cmp.treasury.amount < 10) {
            return "gold-some"
        }

        if (this.cmp.treasury.amount < 100) {
            return "gold-many"
        }

        if (this.cmp.treasury.amount < 300) {
            return "gold-almost"
        }

        return "gold-chest"
    }

    getData(): TreasuryData {
        return {
            id: this.id,
            cmp: {
                upgradable: this.cmp.upgradable.getData(),
                treasury: {
                    ...this.cmp.treasury
                }
            }
        }
    }

    private onTimePassed() {

    }

    textShowTimeout: any

    showText() {
        this.text.setVisibility(true)
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

    getPositionForGoldToFly(): Vec {
        return {x: this.sprite.x + 50, y: this.sprite.y}
    }

    onGoldChanged() {
        this.goldSprite.setTexture(this.getGoldSpriteKey())
        this.goldSprite.setWidth(GOLD_WIDTH)
        this.sprite.setTexture(this.getSpriteKey())
        this.text.setText('Золото: ' + this.cmp.treasury.amount)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    public async gatherGold(gold: Gold[]) {
        let amount = 0
        await Promise.all(gold.map(async g => {
            amount += g.data.amount
            await g.flyToStorage()
            g.destroy()
        }))
        this.addGold(amount)
    }

    addGold(amount: number) {
        o_.audio.playSound(SOUND_KEY.PICK_BIG)
        this.flyingNumbers('+ ' + amount + ' gold')
        this.cmp.treasury.amount += amount
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
        if (amount > this.cmp.treasury.amount) {
            console.error('cant spend more gold than treasury has')
            return
        }
        this.cmp.treasury.amount -= amount
        this.onGoldChanged()
    }

    destroy() {
        this.subs.clear()
        this.sprite.destroy()
        this.text.destroy()
        this.goldSprite.destroy()
        this.isDestroyed = true
    }
}