import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {eventBus, Evt} from "../../event-bus";
import {CursorType} from "../../managers/core/input/cursor";
import {positioner} from "../../managers/game/positioner";
import {createId} from "../../utils/utils-misc";
import {EffectHighlight} from "../../effects/highlight";
import {EffectToTypeMap, EffectType} from "../../effects/types";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";
import {EntityEffect} from "../../effects/entity-effect";
import {Txt} from "../../translations";

type Props = {
    id?: string,
    cmp?: {
        upgradable?: UpgradableComponentData
    }
}

export class Bed {
    id: string

    sprite: O_Sprite

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

    cmp: {
        upgradable: UpgradableComponent
    }

    constructor(props?: Partial<Props>) {
        this.id = props?.id || createId('bed')

        this.sprite = this.createSprite(props?.cmp?.upgradable?.level || 0)

        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {x: this.sprite.x, y: this.sprite.y},
                titleTextKey: Txt.UpgradeBedTitle,
                descriptionTextKey: Txt.UpgradeBed,
                cost: 50,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level: 0,
                ...props?.cmp?.upgradable,
            })
        }

        this.sprite = this.createSprite(this.cmp.upgradable.level)

        this.cmp.upgradable.init()

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

    private effects: Partial<Record<EffectType, EntityEffect>> = {}

    protected getEffect(type: EffectType): EffectToTypeMap[EffectType] | undefined {
        // @ts-ignore
        return this.effects[type]
    }

    protected addEffect(effect: EntityEffect) {
        this.effects[effect.type] = effect
        return effect
    }

    private _canBeUpgraded = () => this.cmp.upgradable.level === 0

    createSprite(level: number): O_Sprite {
        const position = positioner.getBedPosition()
        const spriteKey = level > 0 ? 'bed_upgraded' : 'bed'

        const sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // sprite.setOrigin(0, 0)
        // o_.layers.add(sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true)
        sprite.setWidth(200, false)
        sprite.setHeight(100, false)
        sprite.onClick(() => this.onClick())

        return sprite
    }

    private _upgrade() {
        this.sprite.setTexture('bed_upgraded')
        this.cmp.upgradable.level++
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