import {O_Text} from "../managers/core/render/text";
import {o_} from "../managers/locator";
import {colorsCSS} from "../constants";
import {O_Container} from "../managers/core/render/container";
import {LayerKey} from "../managers/core/layers";
import Timeline = Phaser.Tweens.Timeline;

const MARGIN = 10;

export class Zzz {
    container: O_Container
    letters: O_Text[]
    timeline: Timeline

    constructor(private x: number, private y: number) {
        this.container = o_.render.createContainer(x, y);
        o_.layers.add(this.container, LayerKey.FIELD_BUTTONS);

        this.letters = Array
            .from({length: 3})
            .map((_, i) => {
                const text = o_.render.createText(
                    'z',
                    0,
                    0,
                    {color: colorsCSS.WHITE},
                    {parent: this.container}
                )
                text.setVisibility(false)
                return text;
            })

        const getConfig = (i: number) => (
            {
                targets: this.letters[i],
                ease: 'Linear',
                alpha: 0,
                y: this.y - MARGIN * 6,
                duration: 6000,
                repeat: -1,
                offset: i * 2000,
                onStart: () => this.letters[i].setVisibility(true)
            });
        const getYoyoConfig = (i: number) => ({
            targets: this.letters[i],
            ease: 'Sine.easeInOut',
            yoyo: true,
            x: this.x - 25,
            duration: 1500,
            repeat: -1,
            offset: i * 2000
        })

        this.timeline = o_.render.createTimeline()
        this.timeline.add(getConfig(0))
        this.timeline.add(getYoyoConfig(0))
        this.timeline.add(getConfig(1))
        this.timeline.add(getYoyoConfig(1))
        this.timeline.add(getConfig(2))
        this.timeline.add(getYoyoConfig(2))
        this.timeline.play();
        // don't know why, but without setTimeout can't start the timeline in future
        setTimeout(() => this.timeline.pause())
        this.container.setVisibility(false)
    }

    show(x: number, y: number) {
        this.container.move(x, y)
        this.container.setVisibility(true)
        this.timeline.resume();
    }

    hide() {
        this.container.setVisibility(false)
        this.timeline.pause();
    }

    destroy() {
        this.container.destroy()
    }
}