import {O_Text} from "../../managers/core/render/text";
import {Evt, subscriptions} from "../../event-bus";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {colorsCSS, gameConstants} from "../../constants";
import {O_Sprite} from "../../managers/core/render/sprite";
import {Gold, GoldLocation} from "../gold";
import {flyingStatusChange} from "../../interface/basic/flying-status-change";

export class Treasury {
    text: O_Text
    sprite: O_Sprite

    subs = subscriptions()

    amount = 0

    gold: Gold[] = []

    constructor(position: Vec) {
        this.sprite = o_.render.createSprite('treasury', position.x, position.y)
        this.sprite.setOrigin(0, 0.5)

        this.sprite.setInteractive(true)
        // this.sprite.onClick(() => this.addGold(10))
        // this.sprite.onRightClick(() => this.removeGold(10))
        this.sprite.onPointerOver(() => this.onPointerOver())
        this.sprite.onPointerOut(() => this.onPointerOut())

        this.text = o_.render.createText('Золото: 0', this.sprite.x + 50, this.sprite.y - 40, {color: colorsCSS.WHITE})
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_BUTTONS)

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    private getRect() {
        const padding = 10;
        return {
            x: -padding,
            y: -padding,
            width: 100 + padding * 2,
            height: 100
        }
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
        this.amount = this.gold.reduce((acc, g) => acc + g.amount, 0)
        this.text.setText('Золото: ' + this.amount)
    }

    getNextPosition() {
        const newCoord = {x: this.sprite.x, y: this.sprite.y}

        const lastSprite =  this.gold[this.gold.length - 1]?.sprite
        if (lastSprite) {
            newCoord.x = lastSprite.x + 32 + 10
        }
        return newCoord
    }

    addGold(amount: number) {
        flyingStatusChange('+ ' + amount + ' gold', this.sprite.x, this.sprite.y - 20, colorsCSS.YELLOW)

        const goldEntity = this.gold[this.gold.length - 1];
        if (goldEntity && goldEntity.amount < gameConstants.MAX_GOLD_IN_SPRITE) {
            const addAmount = Math.min(amount, gameConstants.MAX_GOLD_IN_SPRITE - goldEntity.amount)
            goldEntity.setAmount(goldEntity.amount + addAmount)
            amount -= addAmount;
        }

        while (amount > 0) {
            const addAmount = Math.min(amount, gameConstants.MAX_GOLD_IN_SPRITE)
            this.gold.push(new Gold(this.getNextPosition(), addAmount, GoldLocation.TREASURY))
            amount -= addAmount
        }

        this.onGoldChanged()
    }

    removeGold(amount: number) {
        flyingStatusChange('- ' + amount + ' gold', this.sprite.x, this.sprite.y - 20, colorsCSS.RED)
        while (amount > 0) {
            if (this.gold.length === 0) {
                console.error('cant spend more gold that treasure has')
                break;
            }

            const goldEntity = this.gold[this.gold.length - 1];
            const removeAmount = Math.min(amount, goldEntity.amount)
            if (removeAmount === goldEntity.amount) {
                goldEntity.destroy()
                this.gold.pop()
            } else {
                goldEntity.setAmount(goldEntity.amount - removeAmount)
            }
            amount -= removeAmount
        }

        this.onGoldChanged()
    }
}