import {o_} from "./managers/locator";
import {O_Sprite} from "./managers/core/render/sprite";
import {O_Container} from "./managers/core/render/container";
import {getRndSign} from "./utils/utils-math";
import {pause} from "./utils/utils-async";
import {SOUND_KEY} from "./managers/core/audio";

export function destroyInteractiveObjWithJump(obj: { destroy: Function, sprite?: O_Sprite, container?: O_Container }) {
    const a = obj.sprite || obj.container
    if (!a) return

    o_.render.thrownTo(a, {x: a.x + (getRndSign() * 100), y: a.y}, 600)
    o_.render.fadeOut(a, 300)
    pause(500).then(() => obj.destroy())

    o_.audio.playSound(SOUND_KEY.BONK)
}

export function destroyInteractiveObjWithFade(obj: { destroy: Function, sprite?: O_Sprite, container?: O_Container }) {
    const a = obj.sprite || obj.container
    if (!a) return

    o_.render.fadeOut(a, 500)
    pause(600).then(() => obj.destroy())
}