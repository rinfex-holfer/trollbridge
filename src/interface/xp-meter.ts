import {Troll} from "../managers/game/troll/troll";
import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {ProgressBar} from "./basic/progress-bar";
import {colorsNum} from "../constants";
import {getGameSize} from "../utils/utils-misc";
import {pause} from "../utils/utils-async";

enum MeterState {
    FADE_IN = 'FADE_IN',
    CHANGE = 'CHANGE',
    FADE_OUT = 'FADE_OUT',
    HIDDEN = 'HIDDEN',
}

type Transition = [xp: number, nextLevelXp: number, level: number]

const WIDTH = 450;
const HEIGHT = 40;
const Y = 150

export class XpMeter {
    private xpContainer: O_Container
    private xpBar: ProgressBar

    constructor() {
        const gameSize = getGameSize()
        this.xpContainer = o_.render.createContainer(gameSize.width / 2, Y)
        this.xpBar = new ProgressBar({
            x: -WIDTH * 0.5,
            y: 0,
            maxValue: 10,
            value: 0,
            width: WIDTH,
            height: HEIGHT,
            colorOptions: [[0, colorsNum.WHITE], [0.75, colorsNum.GREEN]],
            text: '',
            parent: this.xpContainer,
            withoutNumbers: true
        })
        this.xpContainer.alpha = 0
    }

    state: MeterState = MeterState.HIDDEN

    transitionsQueue: Transition[] = []

    public updateVal(xp: number, nextLevelXp: number, level: number) {
        this.xpBar.setMaxValue(nextLevelXp)
        this.xpBar.setValue(xp, false)

        const text = 'Следующий уровень: ' + +(level + 1)
        this.xpBar.setLabel(text)
    }

    public async addTransition(transition: Transition) {
        this.transitionsQueue.push(transition)

        if (this.state === MeterState.HIDDEN) return this.setState(MeterState.FADE_IN)
    }


    async setState(state: MeterState): Promise<any> {
        this.state = state

        switch (state) {
            case MeterState.FADE_IN:
                return this.fadeIn()
            case MeterState.CHANGE:
                return this.change()
            case MeterState.FADE_OUT:
                return this.fadeOut()
            case MeterState.HIDDEN:
                return;
        }
    }

    async fadeIn() {
        await o_.render.fadeIn(this.xpContainer)
        return this.setState(MeterState.CHANGE)
    }

    async fadeOut() {
        await o_.render.fadeOut(this.xpContainer)

        if (this.transitionsQueue.length) return this.setState(MeterState.FADE_IN)

        return this.setState(MeterState.HIDDEN)
    }

    async change() {
        const nextTransition = this.transitionsQueue.shift()

        if (!nextTransition) return this.setState(MeterState.FADE_OUT)


        const [xp, nextLevelXp, level] = nextTransition;

        this.xpBar.setLabel('Следующий уровень: ' + +(level + 1))
        this.xpBar.setMaxValue(nextLevelXp)
        this.xpBar.setValue(xp, true)

        await pause(1100)

        const isNewLevel = xp === nextLevelXp
        if (isNewLevel) {
            this.xpBar.setValue(0, false)

            this.xpBar.setLabel(`Уровень ${level + 1}!`)
            o_.render.burstYellow(this.xpContainer.x - WIDTH / 2, this.xpContainer.y)
            o_.render.burstYellow(this.xpContainer.x + WIDTH / 2, this.xpContainer.y)
            await pause(500)
            o_.render.burstYellow(this.xpContainer.x - WIDTH / 2, this.xpContainer.y)
            o_.render.burstYellow(this.xpContainer.x + WIDTH / 2, this.xpContainer.y)
            await pause(500)
            o_.render.burstYellow(this.xpContainer.x - WIDTH / 2, this.xpContainer.y)
            o_.render.burstYellow(this.xpContainer.x + WIDTH / 2, this.xpContainer.y)
            await pause(500)
            this.xpBar.setLabel('Следующий уровень: ' + +(level + 2))
            await pause(500)
        }

        return this.setState(MeterState.CHANGE)
    }
}