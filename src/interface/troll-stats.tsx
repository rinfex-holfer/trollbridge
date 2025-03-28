import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {Troll} from "../managers/game/troll/troll";
import {ProgressBar} from "./basic/progress-bar";
import {colorsCSS, colorsNum} from "../configs/constants";
import {XpMeter} from "./xp-meter";
import {TrollAbility} from "../types";
import {positioner} from "../managers/game/positioner";
import {LayerKey} from "../managers/core/layers";
import {getGameSize} from "../utils/utils-misc";
import {ImageKey} from "../utils/utils-types";
import {trollConfig} from "../configs/troll-config";

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
    private fear: ProgressBar

    private xpMeter: XpMeter

    // private mightBar: ProgressBar
    // private wealthBar: ProgressBar

    constructor(private troll: Troll) {
        this.container = o_.render.createContainer(X, Y)
        this.container.setLockedToCamera(true)
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

        this.fear = new ProgressBar({
            x: 0,
            y: MARGIN * 3,
            minValue: -trollConfig.TROLL_MAX_FEAR,
            maxValue: trollConfig.TROLL_MAX_FEAR,
            value: troll.fear,
            width: WIDTH,
            height: HEIGHT,
            colorOptions: [[0, colorsNum.GREEN], [0.165, colorsNum.BLUE], [0.33, colorsNum.WHITE], [0.66, colorsNum.YELLOW], [0.825, colorsNum.RED]],
            text: 'Страшность',
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
        this.fear.setValue(this.troll.fear, animated)
    }

    public updateXp(animated: boolean, xp: number, nextLevelXp: number, level: number) {
        if (!animated) {
            this.xpMeter.updateVal(xp, nextLevelXp, level)
            return Promise.resolve()
        }

        return this.xpMeter.addTransition([xp, nextLevelXp, level])
    }

    public showNewAbility(ability: TrollAbility) {
        const ICON_SIZE = 50
        const gameSize = getGameSize()
        const x = gameSize.width / 2
        const y = gameSize.height / 2

        let str = ''
        let image: ImageKey = 'button_throw_rock'
        switch (ability) {
            case TrollAbility.THROW_ROCK:
                str = 'Метнуть камень'
                image = 'button_throw_rock'
                break;
            case TrollAbility.GRAPPLE:
                str = 'Бросить об землю'
                image = 'button_throw_char'
                break;
            case TrollAbility.MAN_EATER:
                str = 'Сожрать'
                image = 'button_devour'
                break;
        }

        let sprite = o_.render.createSprite(image, x, y, {width: ICON_SIZE, height: ICON_SIZE})
        let text = o_.render.createText({
            textKey: 'New ability: ' + str,
            x,
            y: y + ICON_SIZE,
            style: {
                align: 'center',
                color: colorsCSS.WHITE,
                fontStyle: 'bold',
                fontSize: '22px',
                stroke: colorsCSS.BLACK,
                strokeThickness: 3
            }
        })
        text.setOrigin(0.5, 0)

        sprite.setLockedToCamera(true)
        text.setLockedToCamera(true)

        o_.layers.add(sprite, LayerKey.FIELD_BUTTONS)
        o_.layers.add(text, LayerKey.FIELD_BUTTONS)
        setTimeout(() => {
            o_.render.fadeOut([sprite, text]).then(() => {
                sprite.destroy()
                text.destroy()
            })
        }, 3000)
    }
}