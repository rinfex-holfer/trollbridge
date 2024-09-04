import {O_Sprite} from "../managers/core/render/sprite";
import {O_Container} from "../managers/core/render/container";
import {O_AnimatedSprite} from "../managers/core/render/animated-sprite";
import {EntityEffect} from "../effects/entity-effect";

interface WithGameEntityUtils {
    _containers: Record<string, O_Container>
    _sprites: Record<string, O_Sprite>
    _animatedSprites: Record<string, O_AnimatedSprite>
    _effects: Record<string, EntityEffect>
}

export const addGameEntityUtils = (host: WithGameEntityUtils): WithGameEntityUtils => {
    host._sprites = {}
    host._animatedSprites = {}
    host._containers = {}
    host._effects = {}

    const addSprite = (sprite: O_Sprite) => {

    }
}