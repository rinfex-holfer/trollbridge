import {O_Sprite} from "../managers/core/render/sprite";
import {outlinePipeline} from "../shaders/OutlinePipeline";
import {EntityEffect} from "./entity-effect";
import {EffectType} from "./types";

interface HighlightableEntity {
    sprite: O_Sprite
}

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

export class EffectHighlight extends EntityEffect {
    pipeline: any

    thickness: number

    type = EffectType.HIGHLIGHTED

    entity: HighlightableEntity

    constructor(entity: HighlightableEntity, options: HighlightEffectOptions = {...defaultOptions}) {
        super()

        this.entity = entity

        entity.sprite.obj.setPostPipeline(outlinePipeline.name, options);

        this.thickness = options.thickness ?? 0

        this.pipeline = entity.sprite.obj.getPostPipeline(outlinePipeline.name)

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
        this.entity.sprite.obj.removePostPipeline(outlinePipeline.name)
    }
}