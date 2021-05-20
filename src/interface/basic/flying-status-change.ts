import {GameText, render} from "../../managers/render";
import {colors, zLayers} from "../../constants";

export function flyingStatusChange(text: string, x: number, y: number, color?: string) {
    const status = new GameText(
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

    const timeline = render.scene.tweens.timeline({
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