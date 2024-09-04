import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {eventBus, Evt} from "../../event-bus";
import {SpriteKey} from "../../resourse-paths";
import {createId} from "../../utils/utils-misc";
import {o_logger} from "../../utils/logger";
import {positioner} from "../../managers/game/positioner";
import {EffectHighlight} from "../../effects/highlight";
import {EffectToTypeMap, EffectType} from "../../effects/types";
import {CursorType} from "../../managers/core/input/cursor";
import {O_Sprite} from "../../managers/core/render/sprite";
import {Vec} from "../../utils/utils-math";
import {EntityEffect} from "../../effects/entity-effect";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";
import {Txt} from "../../translations";
import {goldConfig} from "../../configs/gold-config";

const CHAIR_WIDTH = 100

export type ChairData = {
    id: string,
    cmp: {
        upgradable?: UpgradableComponentData
    }
}

const MAX_LEVEL = 3

export class Chair {
    id: string

    sprite: O_Sprite

    coord: Vec

    private waitButton: O_Sprite

    private effects: Partial<Record<EffectType, EntityEffect>> = {}

    cmp: {
        upgradable: UpgradableComponent
    }

    constructor(props?: ChairData) {
        this.id = props?.id || createId('chair')

        this.coord = positioner.getChairPosition()

        const level = props?.cmp?.upgradable?.level || 0
        const position = this.coord
        this.sprite = o_.render.createSprite(this.getSpriteKey(level), position.x, position.y)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.setInteractive(true)
        this.sprite.setWidth(CHAIR_WIDTH)
        this.sprite.setOrigin(0.5, 1)
        this.sprite.onClick(() => this.onClick())

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {
                    x: this.sprite.x,
                    y: this.sprite.y - this.sprite.height
                },
                descriptionTextKey: Txt.UpgradeChair,
                titleTextKey: Txt.UpgradeChairTitle,
                getUpgradeCost: this.getUpgradeCost,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level,
                ...props?.cmp?.upgradable,
            })
        }

        this.cmp.upgradable.init()

        this.waitButton = o_.render.createSprite(
            'button_wait',
            this.sprite.x + this.sprite.width / 2 + 20,
            this.sprite.y - this.sprite.height - 40
        )
        this.waitButton.setWidth(50)
        this.waitButton.onClick(() => {
            eventBus.emit(Evt.INTERFACE_WAIT_BUTTON_CLICKED)
        })
        this.waitButton.setCursor(CursorType.POINTER)
        this.waitButton.setVisibility(false)
        const effect = new EffectHighlight(this.waitButton)
        this.waitButton.onHover(
            () => effect.setActive(true),
            () => effect.setActive(false)
        )
    }

    private _canBeUpgraded = () => {
        return this.cmp.upgradable.level < MAX_LEVEL
    }

    private _upgrade = () => {
        if (!this.cmp.upgradable.canBeUpgraded()) {
            o_logger.error("can't be upgraded, already max level")
            return;
        }
        this.cmp.upgradable.level++
        this.sprite.setTexture(this.getSpriteKey())
        this.sprite.setWidth(CHAIR_WIDTH)
    }

    protected getEffect(type: EffectType): EffectToTypeMap[EffectType] | undefined {
        // @ts-ignore
        return this.effects[type]
    }

    protected addEffect(effect: EntityEffect) {
        this.effects[effect.type] = effect
        return effect
    }

    private _occupied = false

    get occupied() {
        return this._occupied
    }

    set occupied(val: boolean) {
        this._occupied = val

        this.waitButton.setVisibility(val)
        this.waitButton.setInteractive(val)

        if (val) {
            this.setInteractive(false)

            this.waitButton.alpha = 0
            this.waitButton.y = this.waitButton.y + 30
            o_.render.fadeInFromBottom(this.waitButton, 150, 30)
        }
    }

    private setCursor(cursor: CursorType.WAIT | CursorType.POINTER) {
        this.sprite.setCursor(cursor)
    }

    private getSpriteKey(level = this.cmp.upgradable.level): SpriteKey {
        switch (level) {
            case 0:
                return 'chair_0'
            case 1:
                return 'chair_1'
            case 2:
                return 'chair_2'
            case MAX_LEVEL: // 3
                return 'chair_3'
            default:
                throw Error("wrong chair level: " + level)
        }
    }

    getUpgradeCost = () => {
        return goldConfig.costs.chair[this.cmp.upgradable.level]
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_CHAIR_CLICKED)
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
        if (val === false) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        }
    }

    getData(): ChairData {
        return {
            id: this.id,
            cmp: {
                upgradable: this.cmp.upgradable.getData()
            }
        }
    }

    destroy() {
        this.sprite.destroy()
        this.waitButton.destroy()
        Object.keys(this.effects).forEach((key) => this.effects[key as EffectType]?.destroy())
    }
}