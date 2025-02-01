import {o_} from "../managers/locator";
import {AfterBattleAction} from "./char-actions-menu";
import {positioner} from "../managers/game/positioner";
import {VerticalMenu} from "./vertical-menu";
import {AfterBattleTrollActionS} from "../phases/phase-after-battle/actions-after-battle";
import {PhaseActionsAfterBattleWon} from "../phases/phase-after-battle/phase-actions-after-battle-won";
import {CursorType} from "../managers/core/input/cursor";

export class AfterBattleActionsMenu {
    verticalMenu: VerticalMenu<AfterBattleAction>

    phase: PhaseActionsAfterBattleWon

    constructor(phase: PhaseActionsAfterBattleWon) {
        this.phase = phase;

        const bridgePos = positioner.getBridgePosition()

        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const a = Object.values(AfterBattleTrollActionS)
        this.verticalMenu = new VerticalMenu(a, {x, y}, (key) => this.onButtonClick(key))
    }

    onButtonClick(action: AfterBattleAction) {
        this.verticalMenu.selectButton(action)

        o_.characters.getTravellersAfterBattle().forEach(c => {
            const isActive = AfterBattleTrollActionS[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    this.phase.executeAction(action, char)
                })
                c.setCursor(CursorType.POINTER)
            } else {
                c.sprite.removeClickListener()
                c.setCursor(CursorType.BUILD_NOT_ALLOWED)
            }
        })
    }

    show() {
        o_.characters.enableInteractivityOnBridge()
        this.verticalMenu.show()
    }

    hide() {
        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
        this.verticalMenu.hide()
    }

    destroy() {
        this.verticalMenu.destroy()
    }
}