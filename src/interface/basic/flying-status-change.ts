import {colors, colorsCSS} from "../../constants";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";

export function flyingStatusChange(text: string, x: number, y: number, color?: string) {
    const status = o_.render.createText(
        text,
        x,
        y,
        {
            align: 'center',
            color: color || colorsCSS.WHITE,
            fontStyle: 'bold',
            fontSize: '22px',
        }
    )
    o_.layers.add(status, LayerKey.FIELD_BUTTONS);

    const timeline = o_.render.scene.tweens.createTimeline();
    timeline.add({targets: status.obj, ease: 'Power2', y: y - 100, duration: 2000})
    timeline.add({targets: status.obj, ease: 'Power2', alpha: 0, duration: 2000, offset: 1000})

    timeline.play();
}