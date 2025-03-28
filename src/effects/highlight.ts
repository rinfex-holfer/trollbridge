import {O_Sprite} from "../managers/core/render/sprite";
import {outlinePipeline} from "../shaders/OutlinePipeline";
import {EntityEffect} from "./entity-effect";
import {EffectType} from "./types";
import Sprite = Phaser.GameObjects.Sprite;
import {O_AnimatedSprite} from "../managers/core/render/animated-sprite";

export type HighlightableEntity = O_Sprite | O_AnimatedSprite

interface HighlightEffectConfig {
    thickness?: number,
    color?: number
    quality?: number
}

interface HighlightEffectOptions extends HighlightEffectConfig {
    isActive?: boolean
}

const defaultOptions: HighlightEffectOptions = {
    thickness: 3,
    color: 0x33ABF9,
    quality: 0.1,
    isActive: false
}

export class EffectHighlight extends EntityEffect<EffectType.HIGHLIGHTED> {
    pipeline: any

    thickness: number

    type = EffectType.HIGHLIGHTED as const

    entity: HighlightableEntity

    constructor(entity: HighlightableEntity, options: HighlightEffectOptions = {...defaultOptions}) {
        super()

        this.entity = entity

        entity.obj.setPostPipeline(outlinePipeline.name, options);

        this.thickness = options.thickness ?? 0

        this.pipeline = entity.obj.getPostPipeline(outlinePipeline.name)

        this.setOptions({
            color: options.color,
            quality: options.quality,
            thickness: options.isActive ? options.thickness : 0,
        })
    }

    setOptions(options: HighlightEffectConfig) {
        if (options.color !== undefined) {
            this.pipeline.setOutlineColor(options.color)
        }
        if (options.thickness !== undefined) {
            this.pipeline.setThickness(options.thickness)
        }
        if (options.quality !== undefined) {
            this.pipeline.quality = options.quality
        }
    }

    setActive(val: boolean) {
        this.pipeline.setThickness(val ? this.thickness : 0)
    }

    destroy() {
        this.setActive(false)
        this.entity.obj.removePostPipeline(outlinePipeline.name)
    }
}