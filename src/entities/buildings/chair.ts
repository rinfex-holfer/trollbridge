import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {eventBus, Evt} from "../../event-bus";
import {SpriteKey} from "../../resourse-paths";
import {createId} from "../../utils/utils-misc";
import {o_logger} from "../../utils/logger";
import {Txt} from "../../managers/core/texts";
import {positioner} from "../../managers/game/positioner";
import {EffectHighlight} from "../../effects/highlight";
import {EffectToTypeMap, EffectType} from "../../effects/types";
import {CursorType} from "../../managers/core/input/cursor";
import {O_Sprite} from "../../managers/core/render/sprite";
import {Vec} from "../../utils/utils-math";
import {EntityEffect} from "../../effects/entity-effect";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";

const CHAIR_WIDTH = 100

type Props = {
    id?: string,
    cmp?: {
        upgradable?: UpgradableComponentData
    }
}

export class Chair {
    id: string

    sprite: O_Sprite

    coord: Vec

    private waitButton: O_Sprite

    cmp: {
        upgradable: UpgradableComponent
    }

    constructor(props?: Props) {
        this.id = props?.id || createId('chair')

        this.coord = positioner.getChairPosition()

        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {x: this.coord.x, y: this.coord.y},
                textKey: Txt.UpgradeChair,
                cost: 50,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level: 0,
                ...props?.cmp?.upgradable,
            })
        }

        this.cmp.upgradable.init()

        this.sprite = this.createSprite()

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

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
        return this.cmp.upgradable.level >= 4
    }

    private _upgrade = () => {
        if (this.cmp.upgradable.canBeUpgraded()) {
            o_logger.error("can't be upgraded, already max level")
            return;
        }
        this.cmp.upgradable.level++
        this.sprite.setTexture(this.getSpriteKey())
        this.sprite.setWidth(CHAIR_WIDTH)
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

    private createSprite() {
        const position = this.coord
        const sprite = o_.render.createSprite(this.getSpriteKey(), position.x, position.y)
        o_.layers.add(sprite, LayerKey.FIELD_OBJECTS)
        sprite.setInteractive(true)
        sprite.setWidth(CHAIR_WIDTH)
        sprite.setOrigin(0.5, 1)

        sprite.onClick(() => this.onClick())

        return sprite
    }

    private getSpriteKey(): SpriteKey {
        switch (this.cmp.upgradable.level) {
            case 0:
                return 'chair_0'
            case 1:
                return 'chair_1'
            case 2:
                return 'chair_2'
            case 3:
                return 'chair_3'
            default:
                throw Error("wrong chair level: " + this.cmp.upgradable.level)
        }
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
}