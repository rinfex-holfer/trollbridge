import {GamePhase} from "../game-phase";
import {AfterBattleActionsMenu} from "../../interface/after-battle-actions-menu";
import {o_} from "../../managers/locator";
import {AfterBattleAction} from "../../interface/char-actions-menu";
import {Char} from "../../entities/char/char";
import {AfterBattleTrollActionS} from "./actions-after-battle";
import {PhaseBridge} from "../phase-bridge";
import {PhaseKeys} from "../domain";

export class PhaseActionsAfterBattleWon extends GamePhase {

    name = PhaseKeys.AFTER_BATTLE_WON

    afterBattleMenu: AfterBattleActionsMenu

    constructor() {
        super();
        this.afterBattleMenu = new AfterBattleActionsMenu(this)
    }

    onStart() {
        this.afterBattleMenu.show()
    }

    protected onEnd() {
        this.afterBattleMenu.destroy()
    }

    executeAction = async (action: AfterBattleAction, char: Char) => {
        await AfterBattleTrollActionS[action].execute(char)
        if (this.getIsEnd()) {
            this.goToNextPhase(new PhaseBridge())
        }
    }

    getIsEnd = () => {
        return o_.characters.getTravellersAfterBattle().length === 0
    }
}