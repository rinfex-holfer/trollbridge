import {colorsNum} from "../configs/constants";
import {Char} from "../entities/char/Char";
import {ProgressBar} from "./basic/progress-bar";

export class CharHpIndicator {
    bar: ProgressBar

    constructor(private char: Char) {
        this.bar = new ProgressBar({
            x: -15,
            y: -120,
            width: 50,
            height: 5,
            maxValue: char.maxHp,
            value: char.hp,
            color: colorsNum.GREEN,
            colorOptions: [[0, colorsNum.RED], [0.33, colorsNum.ORANGE], [0.66, colorsNum.GREEN]],
            parent: char.container,
            withoutNumbers: true
        })
        this.hide()
    }

    update() {
        this.bar.setValue(this.char.hp)
    }

    show() {
        this.bar.setValue(this.char.hp)
        this.bar.setVisibility(true)
    }

    hide() {
        this.bar.setVisibility(false)
    }
}