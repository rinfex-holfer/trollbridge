import {Vec} from "../utils/utils-math";
import {o_} from "../managers/locator";
import {TextKey, Txt} from "../managers/core/texts";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";
import {LayerKey} from "../managers/core/layers";
import {UpgradableComponent, UpgradableEntity} from "../components/upgradable";

const BUTTON_SIZE = 32
const TEXT_PANEL_WIDTH = 300
const TEXT_PANEL_HEIGHT = BUTTON_SIZE * 2
const TEXT_PADDING = 4
const MARGIN = 5

export class UpgradeButton {
    button: O_Sprite
    cost: number

    isEnabled: boolean = true

    background: O_Sprite
    text: O_Text
    textCost: O_Text

    host: UpgradableEntity

    constructor(private onClickCb: (btn: UpgradeButton) => void, host: UpgradableEntity) {
        const {cost, textKey, buttonCoord} = host.cmp.upgradable

        this.cost = cost
        this.host = host

        this.button = o_.render.createSprite('button_upgrade', buttonCoord.x, buttonCoord.y, {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
        });
        this.button.setOrigin(0.5, 1)
        this.button.setInteractive(true);
        this.button.onClick(this.onClick)

        this.button.onHover(
            () => {
                this.text.setVisibility(true)
                this.background.setVisibility(true)
            },
            () => {
                this.text.setVisibility(false)
                this.background.setVisibility(false)
            },
        )

        this.background = o_.render.createSprite(
            'tile_white',
            buttonCoord.x + BUTTON_SIZE / 2 + MARGIN,
            buttonCoord.y,
            {
                width: TEXT_PANEL_WIDTH,
                height: TEXT_PANEL_HEIGHT
            })
        this.background.setOrigin(0, 1)
        this.background.alpha = 0.5

        this.text = o_.render.createText(
            o_.texts.t(textKey),
            buttonCoord.x + BUTTON_SIZE / 2 + MARGIN,
            buttonCoord.y,
            {
                color: '#000',
                fontStyle: 'bold',
                padding: {x: TEXT_PADDING, y: TEXT_PADDING},
            },
        )
        this.text.setOrigin(0, 1)

        this.textCost = o_.render.createText(
            o_.texts.t(Txt.UpgradeCost1) + " " + cost,
            buttonCoord.x + BUTTON_SIZE / 2 + MARGIN,
            this.text.y + this.text.height * 2,
            {
                color: '#000',
                fontStyle: 'bold',
                padding: {x: TEXT_PADDING, y: TEXT_PADDING},
            },
        )
        this.textCost.setOrigin(0, 1)

        this.background.setWidth(Math.max(this.text.width, this.textCost.width), false)

        o_.layers.add(this.background, LayerKey.FIELD_BUTTONS)
        o_.layers.add(this.text, LayerKey.FIELD_BUTTONS)
        o_.layers.add(this.button, LayerKey.FIELD_BUTTONS)
    }

    onClick = () => {
        if (this.isEnabled) this.onClickCb(this)
    }

    destroy() {
        this.button.destroy()
    }

    isVisible = false

    setVisible(val: boolean) {
        this.isVisible = val
        this.button.setInteractive(val)
        this.button.setVisibility(val)
        this.textCost.setVisibility(val)

        if (!val) {
            this.background.setVisibility(false)
            this.text.setVisibility(false)
            this.textCost.setVisibility(false)
        }

        // TODO in system or component
        if (o_.lair.treasury.amount < this.cost) {
            this.isEnabled = false
            // this.button.visiblyDisable()
        } else {
            //     this.isEnabled = true
            //     this.button.visiblyEnable()
        }
    }
}