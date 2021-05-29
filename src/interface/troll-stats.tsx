import {O_Text} from "../managers/core/render/text";
import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {Troll} from "../managers/game/troll/troll";
import {ProgressBar} from "./basic/progress-bar";
import {colorsNum} from "../constants";
import {getGameSize} from "../utils/utils-misc";
import {createPromiseAndHandlers, pause} from "../utils/utils-async";

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

    private xpContainer: O_Container

    private xpBar: ProgressBar
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

        const gameSize = getGameSize()
        this.xpContainer = o_.render.createContainer(gameSize.width / 2, Y + MARGIN * 4)
        this.xpBar = new ProgressBar({
            x: -WIDTH * 0.75,
            y: 0,
            maxValue: troll.xp,
            value: troll.xp,
            width: WIDTH * 1.5,
            height: HEIGHT * 2,
            colorOptions: [[0, colorsNum.WHITE], [0.75, colorsNum.GREEN]],
            text: 'Уровень: ' + troll.level,
            parent: this.xpContainer,
            withoutNumbers: true
        })
        this.xpContainer.alpha = 0

        this.updateXp(false)
    }

    public update(animated = true) {
        this.hungerBar.setMaxValue(this.troll.maxHunger)
        this.hpBar.setMaxValue(this.troll.maxHp)
        this.selfControl.setMaxValue(this.troll.maxSelfControl)

        this.hungerBar.setValue(this.troll.hunger, animated)
        this.hpBar.setValue(this.troll.hp, animated)
        this.selfControl.setValue(this.troll.selfControl, animated)
    }

    public updateXp(animated = true, announceNewLevel: boolean = false): Promise<any> {
        const nextLevelXp = this.troll.getNextLvlReqs()
        if (this.xpBar.maxValue === nextLevelXp && this.xpBar.value === this.troll.xp) {
            console.log('old values', this.xpBar.value, this.troll.xp, this.troll.level)
            return Promise.resolve()
        }

        if (!animated) {
            this.xpBar.setMaxValue(nextLevelXp)
            this.xpBar.setValue(this.troll.xp, false)
            return Promise.resolve()
        }

        const {promise, done} = createPromiseAndHandlers()

        if (announceNewLevel) this.xpBar.setLabel('Переход на уровень ' + this.troll.level + '!')

        o_.render.fadeIn(this.xpContainer)
            .then(() => {
                console.log('fadeIn after')
                this.xpBar.setMaxValue(nextLevelXp)
                this.xpBar.setValue(this.troll.xp, animated)
                return pause(2000)
            }).then(() => {
                console.log('fadeOut')
                return o_.render.fadeOut(this.xpContainer)
        })
            .then(() => {
                console.log('fadeOut after')
                this.xpBar.setLabel('Уровень ' + this.troll.level)
                done()
            })

        return promise
    }
}