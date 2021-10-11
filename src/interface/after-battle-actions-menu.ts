import {o_} from "../managers/locator";
import {AfterBattleAction} from "./char-actions-menu";
import {resoursePaths} from "../resourse-paths";
import {Char} from "../entities/char/char";
import {positioner} from "../managers/game/positioner";
import {onEncounterEnd} from "../helpers";
import {VerticalMenu} from "./vertical-menu";

type AfterBattleActionSpec = {
    key: AfterBattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: (char: Char) => void
    getIsActive: (char: Char) => boolean
}

const actionSpecs: {[action in AfterBattleAction]: AfterBattleActionSpec} = {
    [AfterBattleAction.RELEASE]: {
        key: AfterBattleAction.RELEASE,
        text: 'Отпустить',
        resource: 'button_release',
        execute: char => o_.characters.releaseChar(char),
        getIsActive: char => true
    },

    [AfterBattleAction.ROB]: {
        key: AfterBattleAction.ROB,
        text: 'Отобрать плату',
        resource: 'button_rob',
        execute: char => {
            char.dropGold(Math.ceil(char.gold * 0.33), true)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => !char.isRobbed
    },

    [AfterBattleAction.TAKE_ALL]: {
        key: AfterBattleAction.TAKE_ALL,
        text: 'Отобрать все',
        resource: 'button_rob',
        execute: char => {
            o_.characters.makeCharGiveAll(char)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => char.gold > 0 || char.food > 0
    },

    [AfterBattleAction.MAKE_FOOD]: {
        key: AfterBattleAction.MAKE_FOOD,
        text: 'Разорвать',
        resource: 'button_make_food',
        execute: char => o_.characters.transformToFood(char) ,
        getIsActive: char => true
    },
}

export class AfterBattleActionsMenu {
    verticalMenu: VerticalMenu<AfterBattleAction>

    constructor() {
        const bridgePos = positioner.bridgePosition()

        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const a = Object.values(actionSpecs)
        this.verticalMenu = new VerticalMenu(a, {x, y}, (key) => this.onButtonClick(key))
    }

    onButtonClick(action: AfterBattleAction) {
        this.verticalMenu.selectButton(action)

        o_.characters.getTravellersAfterBattle().forEach(c => {
            const isActive = actionSpecs[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    actionSpecs[action].execute(char)
                    this.checkEnd()
                })
                c.setCursor('pointer')
            } else {
                c.sprite.removeClickListener()
                c.setCursor('not-allowed')
            }
        })
    }

    checkEnd() {
        if (o_.characters.getTravellersAfterBattle().length === 0) {
            this.hide()
            onEncounterEnd()
        }
    }

    show() {
        o_.characters.enableInteractivityOnBridge()
        this.verticalMenu.show()
    }

    hide() {
        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
        this.verticalMenu.hide()
    }
}