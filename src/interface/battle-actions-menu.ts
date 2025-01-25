import {o_} from "../managers/locator";
import {positioner} from "../managers/game/positioner";
import {VerticalMenu} from "./vertical-menu";
import {PhaseBattle} from "../phases/battle/phase-battle";
import {TrollBattleActions, TrollBattleAction} from "../phases/battle/actions-battle";

export class BattleActionsMenu {
    verticalMenu!: VerticalMenu<TrollBattleAction>

    actions = TrollBattleActions

    battle: PhaseBattle

    constructor(battle: PhaseBattle) {
        this.verticalMenu = this.createVerticalMenu()
        this.battle = battle;
    }

    createVerticalMenu() {
        const bridgePos = positioner.getBridgePosition()
        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const trollActions = o_.troll.getCurrentAbilities()
        const actions = Object.values(TrollBattleActions).filter(a => a.abilityKey === undefined || trollActions.includes(a.abilityKey))
        this.verticalMenu = new VerticalMenu(actions, {x, y}, (key) => this.onClick(key))
        return this.verticalMenu
    }

    onClick(action: TrollBattleAction) {
        this.verticalMenu.selectButton(action)

        o_.characters.getSquadChars().forEach(c => {
            const isActive = TrollBattleActions[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    this.verticalMenu.selectButton(null)
                    this.battle.executeTrollBattleAction(action, char)
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