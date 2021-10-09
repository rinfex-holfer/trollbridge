import {colorsNum} from "../configs/constants";
import {Char} from "../entities/char/char";
import {ProgressBar} from "./basic/progress-bar";
import {Troll} from "../managers/game/troll/troll";
import {o_} from "../managers/locator";
import {pause} from "../utils/utils-async";

export class HpIndicator {
    bar: ProgressBar

    constructor(private char: Char | Troll, x = -15, y = -120, width = 50, height = 5) {
        this.bar = new ProgressBar({
            x,
            y,
            width,
            height,
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
        this.bar.setMaxValue(this.char.maxHp)
        this.bar.setValue(this.char.hp)
    }

    updateShowAndHide() {
        this.show()
        pause(1000).then(() => this.hide())
    }

    show() {
        this.update()
        this.bar.setVisibility(true)
    }

    hide() {
        this.bar.setVisibility(false)
    }
}