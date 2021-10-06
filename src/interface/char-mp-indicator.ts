import {colorsNum} from "../configs/constants";
import {Char} from "../entities/char/char";
import {ProgressBar} from "./basic/progress-bar";

export class CharMpIndicator {
    bar: ProgressBar

    constructor(private char: Char) {
        this.bar = new ProgressBar({
            x: -15,
            y: -110,
            width: 50,
            height: 5,
            maxValue: char.maxMorale,
            value: char.morale,
            color: colorsNum.LIGHT_BLUE,
            colorOptions: [[1, colorsNum.LIGHT_BLUE]],
            parent: char.container,
            withoutNumbers: true
        })
        this.hide()
    }

    update() {
        this.bar.setValue(this.char.morale)
    }

    show() {
        this.bar.setValue(this.char.morale)
        this.bar.setVisibility(true)
    }

    hide() {
        this.bar.setVisibility(false)
    }
}