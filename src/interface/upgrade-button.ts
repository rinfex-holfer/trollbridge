import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";
import {LayerKey} from "../managers/core/layers";
import {UpgradableComponent, UpgradableEntity} from "../components/upgradable";
import {reactUiRef} from "./html/react-ui";
import {O_Container} from "../managers/core/render/container";
import {TextKey, Txt} from "../translations";
import {colorsCSS} from "../configs/constants";
import {sub} from "../utils/utils-events";
import {Evt} from "../event-bus";
import {EffectHighlight} from "../effects/highlight";

const BUTTON_SIZE = 32
const TEXT_PANEL_WIDTH = 300
const TEXT_PANEL_HEIGHT = BUTTON_SIZE * 2
const TEXT_PADDING = 4
const TEXT_INNER_HORIZONTAL_PADDING = 2
const MARGIN = 10

const titleFontSize = '20px';
const descriptionFontSize = '16px';
const costFontSize = '16px';
const notEnoughMoneyColor = colorsCSS.RED

export class UpgradeButton {
    button: O_Sprite
    getUpgradeCost: () => number

    isEnabled: boolean = true

    textContainer: O_Container
    background: O_Sprite

    host: UpgradableEntity

    titleKey: TextKey | (() => TextKey)
    descriptionKey?: TextKey | (() => TextKey)

    titleText: O_Text
    descriptionText?: O_Text
    costText: O_Text
    costTextNotEnough: O_Text

    unsub: VoidFunction

    constructor(private onClickCb: (btn: UpgradeButton) => void, host: UpgradableEntity) {
        this.unsub = sub(Evt.RESOURSES_CHANGED, this.updateEnabledState)

        const {getUpgradeCost, titleTextKey, buttonCoord, descriptionTextKey} = host.cmp.upgradable

        this.descriptionKey = descriptionTextKey
        this.titleKey = titleTextKey || Txt.UpgradeTitle
        this.getUpgradeCost = getUpgradeCost
        this.host = host

        this.button = o_.render.createSprite('button_upgrade', buttonCoord.x, buttonCoord.y, {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
        });
        this.button.setOrigin(0.5, 1)
        this.button.setInteractive(true)
        this.button.onClick(this.onClick)

        const textContainerX = buttonCoord.x + BUTTON_SIZE / 2 + MARGIN
        const textContainerY = buttonCoord.y - BUTTON_SIZE
        this.textContainer = o_.render.createContainer(textContainerX, textContainerY)

        this.background = o_.render.createSprite(
            'tile_white',
            0,
            0,
            {
                width: TEXT_PANEL_WIDTH,
                height: TEXT_PANEL_HEIGHT,
                parent: this.textContainer
            })
        this.background.setOrigin(0, 0)
        this.background.alpha = 0.75

        this.titleText = o_.render.createText({
                textKey: typeof this.titleKey === 'function' ? this.titleKey() : this.titleKey,
                x: 0,
                y: 0,
                style: {
                    color: '#000',
                    fontStyle: 'bold',
                    fontSize: titleFontSize,
                    padding: {x: TEXT_PADDING, y: TEXT_PADDING},
                },
                parent: this.textContainer
            }
        )
        this.titleText.setOrigin(0, 0)

        o_.layers.add(this.titleText, LayerKey.FIELD_BUTTONS)

        if (this.descriptionKey) {
            this.descriptionText = o_.render.createText({
                textKey: typeof this.descriptionKey === 'function' ? this.descriptionKey() : this.descriptionKey,
                x: 0,
                y: this.titleText.getBottomCenter().y,
                style: {
                    color: '#000',
                    fontSize: descriptionFontSize,
                    padding: {x: TEXT_PADDING, y: TEXT_PADDING},
                },
                parent: this.textContainer
            })
            this.descriptionText.setOrigin(0, 0)
        }

        const costTextY = this.descriptionText?.getBottomCenter().y || this.titleText.getBottomCenter().y
        this.costText = o_.render.createText({
            textKey: Txt.UpgradeCost,
            textVars: {amount: this.getUpgradeCost()},
            x: 0,
            y: costTextY,
            style: {
                color: '#000',
                fontStyle: 'bold',
                fontSize: costFontSize,
                padding: {x: TEXT_PADDING, y: TEXT_PADDING},
            },
            parent: this.textContainer
        })
        this.costText.setOrigin(0, 0)

        this.costTextNotEnough = o_.render.createText({
            textKey: this.getIsEnoughGold() ? '' : Txt.UpgradeCostNotEnoughMoney,
            textVars: {amount: this.getUpgradeCost()},
            x: this.costText.getRightCenter().x - TEXT_PADDING,
            y: costTextY,
            style: {
                color: notEnoughMoneyColor,
                fontStyle: 'bold',
                fontSize: costFontSize,
                padding: {x: 0, y: TEXT_PADDING},
            },
            parent: this.textContainer
        })
        this.costTextNotEnough.setOrigin(0, 0)

        this.background.setWidth(Math.max(this.titleText.width, this.descriptionText?.width || 0, this.costTextNotEnough.getRightCenter().x), false)
        this.background.setHeight(Math.max(this.costText.getBottomCenter().y), false)
        this.textContainer.y = this.textContainer.y - this.costText.getBottomCenter().y + BUTTON_SIZE / 2
        o_.layers.add(this.textContainer, LayerKey.FIELD_BUTTONS)
        o_.layers.add(this.button, LayerKey.FIELD_BUTTONS)

        const effect = new EffectHighlight(this.button)

        const tween = o_.render.createUpDownMovementTween(this.button, 15, 500)
        tween.play()
        this.button.onHover(
            () => {
                effect.setActive(true)
                this.textContainer.alpha = 0
                o_.render.fadeIn(this.textContainer, 200)
                this.textContainer.setVisibility(true)
            },
            () => {
                effect.setActive(false)
                this.textContainer.setVisibility(false)
            },
        )
    }

    onClick = () => {
        if (this.isEnabled) this.onClickCb(this)
    }

    destroy() {
        this.button.destroy()
        this.textContainer.destroy()
    }

    isVisible = false

    updateEnabledState = () => {
        this.isEnabled = this.getIsEnoughGold()

        if (typeof this.titleKey === 'function') {
            this.titleText?.setText(this.titleKey())
        }
        if (typeof this.descriptionKey === 'function') {
            this.descriptionText?.setText(this.descriptionKey())
        }

        this.costText.setText(Txt.UpgradeCost, {amount: this.getUpgradeCost()})
        this.costTextNotEnough.setText(this.isEnabled ? Txt.Empty : Txt.UpgradeCostNotEnoughMoney)
        this.background.setWidth(Math.max(this.titleText.width, this.descriptionText?.width || 0, this.costTextNotEnough.getRightCenter().x), false)
    }

    getIsEnoughGold = () => o_.lair.treasury?.cmp.treasury.amount >= this.getUpgradeCost()

    setVisible = (val: boolean) => {
        this.isVisible = val
        this.button.setInteractive(val)
        this.button.setVisibility(val)

        if (!val) {
            this.textContainer.setVisibility(false)
        }

        this.updateEnabledState()
    }
}