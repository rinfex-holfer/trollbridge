import {colorsNum} from "../../configs/constants";
import {o_} from "../../managers/locator";
import {O_Container} from "../../managers/core/render/container";
import {O_Text} from "../../managers/core/render/text";

type ColorOptions = [minRange: number, color: number][]

type ProgressBarOptions = {
    x: number,
    y: number,
    width: number,
    height: number,
    text?: string,
    textStyle?: any,
    minValue?: number,
    maxValue?: number,
    value?: number,
    color?: number,
    colorOptions?: ColorOptions,
    parent?: O_Container
    withoutNumbers?: boolean
}

export class ProgressBar {
    private x: number
    private y: number
    private width: number
    private height: number
    private color: number
    private colorOptions: ColorOptions

    private rectOuter: Phaser.GameObjects.Graphics
    private rect: Phaser.GameObjects.Shape
    container: O_Container
    value: number
    maxValue: number
    minValue: number

    private label?: string
    private text: O_Text

    private withoutNumbers: boolean

    constructor(private options: ProgressBarOptions) {
        this.x = options.x
        this.y = options.y
        this.width = options.width
        this.height = options.height
        this.color = options.color || colorsNum.GREEN
        this.colorOptions = options.colorOptions || [[0, colorsNum.GREEN]]

        this.maxValue = options.maxValue || 100
        this.value = options.value || this.maxValue
        this.minValue = options.minValue || 0

        this.container = o_.render.createContainer(this.x, this.y, options.parent ? {parent: options.parent} : undefined)

        this.rect = o_.render.scene.add.rectangle(0, 0, this.width, this.height, this.color);
        this.rect.setOrigin(0, 0)

        this.rectOuter = new Phaser.GameObjects.Graphics(o_.render.scene, {x: 0, y: 0})
        this.rectOuter.lineStyle(2, colorsNum.WHITE, 0.5)
        this.rectOuter.fillStyle(colorsNum.BLACK, 0.3)
        this.rectOuter.fillRect(0, 0, this.width, this.height)
        this.rectOuter.strokeRect(0, 0, this.width, this.height)

        this.container.obj.add(this.rect);
        this.container.obj.add(this.rectOuter);

        this.withoutNumbers = options.withoutNumbers || false
        this.label = options.text
        this.text = o_.render.createText('', this.width / 2, this.height / 2, options.textStyle || {}, {parent: this.container})
        this.text.setOrigin(0.5, 0.5)
        this.updateText()
    }

    private updateText(val: number = this.value) {
        let str = ''
        if (this.label) str = `${this.label}`
        if (!this.withoutNumbers) {
            // if (this.label) str += `: ${Math.round(val)}/${this.maxValue}`
            // else str += `${Math.round(val)}/${this.maxValue}`

            if (this.label) str += `: ${Math.round(val)}`
            else str += `${Math.round(val)}`
        }

        this.text.setText(str)
    }

    private updateScale() {
        this.rect.scaleX = this.getPercent()
    }

    private getPercent() {
        const range = this.maxValue - this.minValue // 200
        return (this.value - this.minValue) / range
    }

    private updateColor() {
        const currentRatio = this.getPercent()

        for (let i = 0; i < this.colorOptions.length; i++) {
            const borderRatio = this.colorOptions[i][0];
            const nextBorderRatio = this.colorOptions[i + 1]?.[0];

            if (currentRatio >= borderRatio && (nextBorderRatio === undefined || currentRatio < nextBorderRatio)) {
                this.color = this.colorOptions[i][1]
                this.rect.fillColor = this.color
            }
        }
    }

    private update() {
        this.updateScale()
        this.updateText()
        this.updateColor()
    }

    public setMaxValue(val: number) {
        if (val === this.maxValue) return

        this.maxValue = val;
        this.update()
    }

    public setValue(val: number, animated = true) {
        if (this.value === val) return

        if (!animated) {
            this.value = val
            this.update()
            return
        }

        const timeline = o_.render.createTween({
            targets: this,
            value: val,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onUpdate: () => {
                this.update()
            },
            onComplete: () => {
                this.update()
            }
        })

        timeline.play()
    }

    setVisibility(val: boolean) {
        this.container.setVisibility(val)
    }

    setLabel(text: string) {
        this.label = text
        this.updateText()
    }
}