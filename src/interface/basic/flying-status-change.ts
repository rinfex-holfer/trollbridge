import {colors} from "../../constants";
import {o_} from "../../managers/locator";

export function flyingStatusChange(text: string, x: number, y: number, color?: string) {
    const status = o_.render.createText(
        text,
        x,
        y,
        {
            align: 'center',
            color: color || colors.WHITE,
            fontStyle: 'italic',
            fontSize: '22px',
        }
    )

    const timeline = o_.render.scene.tweens.timeline({
        targets: status,
        duration: 2100,
        delay: Math.random() * 2,
        ease: 'Power2',
        tweens: [
            {y: y - 100, duration: 2000},
            {alpha: 0, duration: 2000, offset: 1000},
        ]
    });
    timeline.play();
}