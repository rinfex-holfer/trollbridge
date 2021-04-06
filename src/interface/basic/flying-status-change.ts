import {render} from "../../managers/render";
import {colors, zLayers} from "../../constants";
import { gsap } from "gsap";

const moveEnd = 2.0;
const alphaChangeStart = 1.0;
const alphaChangeDuration = moveEnd - alphaChangeStart + 0.1
const L_ALPHA = 'alpha'

export function flyingStatusChange(text: string, x: number, y: number, color?: string) {
    const status = render.createText(
        text,
        x,
        y,
        {
            align: 'center',
            fill: color || colors.WHITE,
            fontStyle: 'italic',
            fontSize: 22,
            wordWrap: false
        }
    );
    status.zIndex = zLayers.PARTICLES

    const timeline = gsap.timeline()
    timeline.addLabel(L_ALPHA, alphaChangeStart)

    timeline.to(
        status,
        {
            pixi: {y: y - 100},
            duration: moveEnd,
            ease: 'power2.out',
        }
    );

    timeline.to(
        status,
        {
            pixi: {alpha: 0},
            duration: alphaChangeDuration,
            onComplete: () => status.destroy(),
        },
        L_ALPHA
    );
}