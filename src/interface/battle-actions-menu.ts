import {o_} from "../managers/locator";
import {BattleAction} from "./char-actions-menu";
import {resoursePaths} from "../resourse-paths";
import {Char} from "../entities/char/char";
import {positioner} from "../managers/game/positioner";
import {VerticalMenu} from "./vertical-menu";
import {TrollAbility} from "../types";

type BattleActionSpec = {
    key: BattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    abilityKey?: TrollAbility,
    execute: (char: Char) => void
    getIsActive: (char: Char) => boolean
    getDisabledAndReason?: () => false | string
}

const actionSpecs: {[action in BattleAction]: BattleActionSpec} = {
    [BattleAction.BATTLE_HIT]: {
        key: BattleAction.BATTLE_HIT,
        text: 'Ударить',
        resource: 'button_strike',
        execute: char => o_.battle.trollGoAttack(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered() && !char.isSurrender,
    },

    [BattleAction.BATTLE_THROW_ROCK]: {
        key: BattleAction.BATTLE_THROW_ROCK,
        text: 'Метнуть камень',
        resource: 'button_throw_rock',
        abilityKey: TrollAbility.THROW_ROCK,
        execute: char => o_.battle.trollThrowRock(char),
        getIsActive: char => char.hp > 0 && !(char.isUnconscious && char.getIsCovered()) && !char.isSurrender,
        getDisabledAndReason: () => o_.bridge.getHasAvailableRocks() ? false : 'нет камней, надо починить мост'
    },

    [BattleAction.BATTLE_THROW_CHAR]: {
        key: BattleAction.BATTLE_THROW_CHAR,
        text: 'Бросить об землю',
        resource: 'button_throw_char',
        abilityKey: TrollAbility.GRAPPLE,
        execute: char => o_.battle.trollGoThrowChar(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered() && !char.isMounted && !char.isSurrender,
        getDisabledAndReason: () => o_.troll.grappleCooldown > 0 ? 'Cooldown: ' + o_.troll.grappleCooldown : false
    },

    [BattleAction.BATTLE_DEVOUR]: {
        key: BattleAction.BATTLE_DEVOUR,
        abilityKey: TrollAbility.MAN_EATER,
        text: 'Сожрать лежачего',
        resource: 'button_devour',
        execute: char => o_.battle.trollGoDevour(char),
        getIsActive: char => char.isUnconscious && !char.getIsCovered()
    },
}

export class BattleActionsMenu {
    verticalMenu!: VerticalMenu<BattleAction>

    actions = actionSpecs

    constructor() {
        // this.verticalMenu = this.createVerticalMenu()
    }

    createVerticalMenu() {
        const bridgePos = positioner.bridgePosition()
        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const trollActions = o_.troll.getCurrentAbilities()
        const actions = Object.values(actionSpecs).filter(a => a.abilityKey === undefined || trollActions.includes(a.abilityKey))
        this.verticalMenu = new VerticalMenu(actions, {x, y}, (key) => this.onClick(key))
        return this.verticalMenu
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
        this.createVerticalMenu()
        this.verticalMenu.updateButtons()
        this.verticalMenu.show()
    }

    hide() {
        this.verticalMenu.deactivateAllButtons()
        this.verticalMenu.hide().then(() => {
            this.verticalMenu.destroy()
        })

        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
    }
}