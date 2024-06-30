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
import {debugExpose} from "../../utils/utils-misc";

export class Treasury {
    text: O_Text
    sprite: O_Sprite

    subs = eventBusSubscriptions()

    amount = 0

    gold: Gold[] = []

    constructor(position: Vec) {
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
            textKey: 'Золото: 0',
            x: this.sprite.x + 50,
            y: this.sprite.y - 40,
            style: {color: colorsCSS.WHITE}
        })
        this.text.setOrigin(0.5, 1)
        this.text.setVisibility(false)
        o_.layers.add(this.text, LayerKey.FIELD_BUTTONS)

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())

        debugExpose((amount: number) => this.addGold(amount), 'addGold')
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
        this.amount = this.gold.reduce((acc, g) => acc + g.props.amount, 0)
        this.text.setText('Золото: ' + this.amount)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    public async gatherGold(gold: Gold[]) {
        let amount = 0
        await Promise.all(gold.map(g => {
            amount += g.props.amount
            return g.flyToStorage()
        }))
        this.addGold(amount)
    }

    getNextPosition() {
        const newCoord = {x: this.sprite.x, y: this.sprite.y}

        const lastSprite = this.gold[this.gold.length - 1]?.sprite
        if (lastSprite) {
            newCoord.x = lastSprite.x + GOLD_WIDTH + 10
        }
        return newCoord
    }

    addGold(amount: number) {
        o_.audio.playSound(SOUND_KEY.PICK_BIG)
        this.flyingNumbers('+ ' + amount + ' gold')

        const goldEntity = this.gold[this.gold.length - 1];
        if (goldEntity && goldEntity.props.amount < goldConfig.MAX_GOLD_IN_SPRITE) {
            const addAmount = Math.min(amount, goldConfig.MAX_GOLD_IN_SPRITE - goldEntity.props.amount)
            goldEntity.setAmount(goldEntity.props.amount + addAmount)
            amount -= addAmount;
        }

        while (amount > 0) {
            const addAmount = Math.min(amount, goldConfig.MAX_GOLD_IN_SPRITE)
            this.gold.push(new Gold(this.getNextPosition(), addAmount, GoldLocation.TREASURY))
            amount -= addAmount
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
            const removeAmount = Math.min(amount, goldEntity.props.amount)
            if (removeAmount === goldEntity.props.amount) {
                goldEntity.destroy()
                this.gold.pop()
            } else {
                goldEntity.setAmount(goldEntity.props.amount - removeAmount)
            }
            amount -= removeAmount
        }

        this.onGoldChanged()
    }
}