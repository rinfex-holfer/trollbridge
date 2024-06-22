import {o_} from "../../../managers/locator";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {eventBus, Evt} from "../../../event-bus";
import {CursorType} from "../../../managers/core/input/cursor";
import {BasicBuilding} from "../basic-building/basic-building";
import {BuildingType} from "../types";
import {BedProps} from "./types";
import {positioner} from "../../../managers/game/positioner";
import {MakeOptional} from "../../../utils/utils-types";
import {BuildingProps} from "../basic-building/types";
import {createId} from "../../../utils/utils-misc";
import {EffectHighlight} from "../../../effects/highlight";
import {EffectType} from "../../../effects/types";

const defaultProps: BedProps = {
    level: 1
}

type Props = BedProps & MakeOptional<BuildingProps, "id">

export class Bed extends BasicBuilding<BuildingType.BED> {
    type = BuildingType.BED as BuildingType.BED

    upgraded = false

    private _occupied = false

    private sleepButton: O_Sprite

    get occupied() {
        return this._occupied
    }

    set occupied(val: boolean) {
        this._occupied = val
        this.sleepButton.setVisibility(val)
        this.sleepButton.setInteractive(val)

        if (val) {
            this.sleepButton.alpha = 0
            this.sleepButton.y = this.sleepButton.y + 30
            o_.render.fadeInFromBottom(this.sleepButton, 150, 30)
            this.setInteractive(false)
        }
    }

    constructor(props?: Partial<Props>) {
        const finalProps = {
            ...defaultProps,
            id: props?.id || createId('bed'),
            ...props
        }
        super(finalProps)

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'кровать', 50, () => this.upgrade())

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.sleepButton = o_.render.createSprite(
            'button_sleep',
            this.sprite.x + this.sprite.width / 2 + 30,
            this.sprite.y - this.sprite.height / 2 - 40
        )
        this.sleepButton.setWidth(50)
        this.sleepButton.onClick(() => {
            eventBus.emit(Evt.INTERFACE_SLEEP_BUTTON_CLICKED)
        })
        this.sleepButton.setCursor(CursorType.POINTER)
        this.sleepButton.setVisibility(false)
        const effect = new EffectHighlight(this.sleepButton)
        this.sleepButton.onHover(
            () => effect.setActive(true),
            () => effect.setActive(false)
        )
    }

    createSprite(props: Props): O_Sprite {
        const position = positioner.getBedPosition()
        const spriteKey = this.upgraded ? 'bed_upgraded' : 'bed'

        const sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // sprite.setOrigin(0, 0)
        // o_.layers.add(sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true)
        sprite.setWidth(200, false)
        sprite.setHeight(100, false)
        sprite.onClick(() => this.onClick())

        return sprite
    }

    upgrade() {
        this.sprite.setTexture('bed_upgraded')
        this.upgraded = true
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
        if (val === false) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        }
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_BED_CLICKED)
    }

    setCursor(cursor: CursorType.POINTER | CursorType.SLEEP) {
        this.sprite.setCursor(cursor)
    }
}