import {o_} from "../../managers/locator";
import {EffectHighlight} from "../../effects/highlight";
import {EffectToTypeMap, EffectType} from "../../effects/types";
import {O_Sprite} from "../../managers/core/render/sprite";
import {positioner} from "../../managers/game/positioner";
import {eventBus, Evt} from "../../event-bus";
import {EntityEffect} from "../../effects/entity-effect";

export class Tools {
    id = 'tools_0'
    sprite: O_Sprite


    isHovered = false

    constructor() {
        this.sprite = this.createSprite()
        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => {
                this.isHovered = true
                this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true)
            },
            () => {
                this.isHovered = false
                if (!this.isAlwaysHighlighted) {
                    this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
                }
            }
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

    createSprite(): O_Sprite {
        const position = positioner.getToolsPosition()
        const spriteKey = 'tools'
        const sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // sprite.setOrigin(0, 0)
        // o_.layers.add(sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true)
        sprite.setWidth(100)
        sprite.onClick(() => this.onClick())

        return sprite
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
        if (val === false) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
            o_.input.setDefaultCursor()
        }
    }

    isAlwaysHighlighted = false
    setAlwaysHighlighted = (val: boolean) => {
        this.isAlwaysHighlighted = val;

        if (val) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true)
        } else {
            if (!this.isHovered) {
                this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
            }
        }
    }

    onClick = () => {
        eventBus.emit(Evt.INTERFACE_TOOLS_CLICKED)
    }
}