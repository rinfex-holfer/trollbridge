import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {Troll} from "../managers/game/troll/troll";
import {ProgressBar} from "./basic/progress-bar";
import {colorsNum} from "../constants";
import {XpMeter} from "./xp-meter";

const X = 50
const Y = 30
const MARGIN = 30
const WIDTH = 300;
const HEIGHT = 20;

export class TrollStats {
    private container: O_Container

    private hungerBar: ProgressBar
    private hpBar: ProgressBar
    private selfControl: ProgressBar

    private xpMeter: XpMeter
    // private mightBar: ProgressBar
    // private wealthBar: ProgressBar

    constructor(private troll: Troll) {
        this.container = o_.render.createContainer(X, Y)
        // this.xp = o_.render.createText('Опыт: ', 0, MARGIN*3, {}, {parent: this.container})
        // this.level = o_.render.createText('Уровень: ', 0, MARGIN*4, {}, {parent: this.container})

        this.hpBar = new ProgressBar({
            x: 0,
            y: 0,
            maxValue: troll.maxHp,
            value: troll.hp,
            width: WIDTH,
            height: HEIGHT,
            colorOptions: [[0, colorsNum.RED], [0.33, colorsNum.ORANGE], [0.66, colorsNum.GREEN]],
            text: 'Здоровье',
            parent: this.container
        })

        this.hungerBar = new ProgressBar({
            x: 0,
            y: MARGIN,
            maxValue: troll.maxHunger,
            value: troll.hunger,
            width: WIDTH,
            height: HEIGHT,
            colorOptions: [[0, colorsNum.GREEN], [0.5, colorsNum.ORANGE], [0.8, colorsNum.RED]],
            text: 'Голод',
            parent: this.container
        })

        this.selfControl = new ProgressBar({
            x: 0,
            y: MARGIN * 2,
            maxValue: troll.maxSelfControl,
            value: troll.selfControl,
            width: WIDTH,
            height: HEIGHT,
            colorOptions: [[0, colorsNum.RED], [0.33, colorsNum.ORANGE], [0.66, colorsNum.GREEN]],
            text: 'Самоконтроль',
            parent: this.container
        })

        this.xpMeter = new XpMeter()

        this.xpMeter.updateVal(troll.xp, troll.getNextLvlReqs(), troll.level)
    }

    public update(animated = true) {
        this.hungerBar.setMaxValue(this.troll.maxHunger)
        this.hpBar.setMaxValue(this.troll.maxHp)
        this.selfControl.setMaxValue(this.troll.maxSelfControl)

        this.hungerBar.setValue(this.troll.hunger, animated)
        this.hpBar.setValue(this.troll.hp, animated)
        this.selfControl.setValue(this.troll.selfControl, animated)
    }

    public updateXp(animated: boolean, xp: number, nextLevelXp: number, level: number) {
        if (!animated) {
            this.xpMeter.updateVal(xp, nextLevelXp, level)
            return Promise.resolve()
        }

        return this.xpMeter.addTransition([xp, nextLevelXp, level])
    }
}