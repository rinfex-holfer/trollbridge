import {colors, colorsCSS} from "../../configs/constants";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {O_Container} from "../../managers/core/render/container";
import {rndBetween} from "../../utils/utils-math";
import {createPromiseAndHandlers} from "../../utils/utils-async";
import {TextKey} from "../../translations";

export function flyingStatusChange(text: TextKey, x: number, y: number, color?: string, direction?: 'left' | 'right') {
    const status = o_.render.createText({
        textKey: text,
        x,
        y,
        style: {
            align: 'center',
            color: color || colorsCSS.WHITE,
            fontStyle: 'bold',
            fontSize: '22px',
            stroke: colorsCSS.BLACK,
            strokeThickness: 3
        },
    })
    status.setOrigin(0.5, 0.5)
    o_.layers.add(status, LayerKey.FIELD_BUTTONS);

    let yTarget = y - 100
    let xTarget
    if (direction) {
        xTarget = direction === 'left' ? rndBetween(x - 200, x - 100) : rndBetween(x + 100, x + 200)
        yTarget = rndBetween(y - 100, y - 10)
    }

    const p = createPromiseAndHandlers()
    const posTweenConfig = {targets: status.obj, ease: 'Cubic.easeOut', y: yTarget, duration: 2000}

    // @ts-ignore
    if (xTarget) posTweenConfig.x = xTarget
    const tween = o_.render.createTweenChain([
        posTweenConfig,
        {targets: status.obj, ease: 'Linear', alpha: 0, duration: 500, offset: 1500, onComplete: p.done}
    ]);

    tween.play();

    return p.promise
}