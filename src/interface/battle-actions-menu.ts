import {o_} from "../managers/locator";
import {AfterBattleAction, BattleAction} from "./char-actions-menu";
import {resoursePaths} from "../resourse-paths";
import {Char} from "../entities/char/char";
import {colorsCSS} from "../configs/constants";
import {positioner} from "../managers/game/positioner";
import {O_Container} from "../managers/core/render/container";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";
import {LayerKey} from "../managers/core/layers";
import {VerticalMenu} from "./vertical-menu";

type BattleActionSpec = {
    key: BattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: (char: Char) => void
    getIsActive: (char: Char) => boolean
}

const actionSpecs: {[action in BattleAction]: BattleActionSpec} = {
    [BattleAction.BATTLE_HIT]: {
        key: BattleAction.BATTLE_HIT,
        text: 'Ударить',
        resource: 'button_strike',
        execute: char => o_.battle.trollGoAttack(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered()
    },

    [BattleAction.BATTLE_THROW_ROCK]: {
        key: BattleAction.BATTLE_THROW_ROCK,
        text: 'Метнуть камень',
        resource: 'button_throw_rock',
        execute: char => o_.battle.trollThrowRock(char),
        getIsActive: char => char.hp > 0 && o_.bridge.getHasAvailableRocks() && !(char.isUnconscious && char.getIsCovered())
    },

    [BattleAction.BATTLE_THROW_CHAR]: {
        key: BattleAction.BATTLE_THROW_CHAR,
        text: 'Бросить об землю',
        resource: 'button_throw_char',
        execute: char => o_.battle.trollGoThrowChar(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered()
    },

    [BattleAction.BATTLE_DEVOUR]: {
        key: BattleAction.BATTLE_DEVOUR,
        text: 'Сожрать',
        resource: 'button_devour',
        execute: char => o_.battle.trollGoDevour(char),
        getIsActive: char => (char.isUnconscious || char.isSurrender) && !char.getIsCovered()
    },
}

export class BattleActionsMenu {
    verticalMenu: VerticalMenu<BattleAction>

    actions = actionSpecs

    constructor() {
        const bridgePos = positioner.bridgePosition()

        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const a = Object.values(actionSpecs)
        this.verticalMenu = new VerticalMenu(a, {x, y}, (key) => this.onClick(key))
    }

    onClick(action: BattleAction) {
        this.verticalMenu.selectButton(action)

        o_.characters.getSquadChars().forEach(c => {
            const isActive = actionSpecs[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    actionSpecs[action].execute(char)
                    this.verticalMenu.selectButton(null)
                })
                c.setCursor('pointer')
            } else {
                c.sprite.removeClickListener()
                c.setCursor('not-allowed')
            }
        })
    }

    show() {
        this.verticalMenu.show()
    }

    hide() {
        this.verticalMenu.hide()

        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
    }
}