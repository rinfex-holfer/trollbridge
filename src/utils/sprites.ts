import {O_Sprite} from "../managers/core/render/sprite";

export const removeFromParentContainer = (sprite: O_Sprite) => {
    sprite.x += sprite.obj.parentContainer.x
    sprite.y += sprite.obj.parentContainer.y
    sprite.obj.parentContainer.remove(sprite.obj)
}