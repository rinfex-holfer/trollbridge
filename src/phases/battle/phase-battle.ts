import {GamePhase} from "../game-phase";
import {BattleActionsMenu} from "../../interface/battle-actions-menu";
import {o_} from "../../managers/locator";
import {eventBus, Evt} from "../../event-bus";
import {pause} from "../../utils/utils-async";
import {EncounterDanger} from "../../types";
import {getRndItem} from "../../utils/utils-math";
import {Char} from "../../entities/char/char";
import {TrollBattleAction, TrollBattleActions} from "./actions-battle";
import {PhaseBridge} from "../phase-bridge";
import {PhaseActionsAfterBattleWon} from "../phase-after-battle/phase-actions-after-battle-won";
import {PhaseKeys} from "../domain";
import {trollConfig} from "../../configs/troll-config";
import {CharStateKey} from "../../entities/char/char-constants";

export class PhaseBattle extends GamePhase {

    name = PhaseKeys.BATTLE

    actionsMenu: BattleActionsMenu

    xpForBattle = 0

    encounterDanger = o_.characters.getDangerKey()

    constructor() {
        super();
        this.actionsMenu = new BattleActionsMenu(this)
    }

    onStart() {
        const fighters = o_.characters.getFighters();
        if (fighters.length === 0) {
            return o_.characters.allSurrender();
        }

        o_.troll.alwaysShowHp(true)

        eventBus.emit(Evt.BATTLE_STARTED)

        this.xpForBattle = o_.troll.getXpForSquad(fighters.map(f => f.key))

        o_.characters.startFighting();

        pause(1000).then(() => this.trollTurn())
    }

    protected onEnd() {
        eventBus.emit(Evt.BATTLE_END)

        this.actionsMenu.hide()

        o_.troll.setEnraged(false)
        o_.troll.resetCooldownds()
        o_.troll.alwaysShowHp(false)
        o_.troll.setHpIndicatorVisible(false)
    }

    async executeTrollBattleAction(action: TrollBattleAction, char: Char) {
        await TrollBattleActions[action].execute(char, this)
        if (this.getIsWin()) return this.win()
        if (this.getIsFail()) return this.fail()
        this.travellersTurn()
    }

    getIsShouldEnd = () => this.getIsFail() || this.getIsWin()

    getIsWin = () => {
        const fighters = o_.characters.getFighters();
        return fighters.length === 0
    }

    getIsFail = () => {
        return !o_.troll.getIsAlive();
    }

    async trollTurn() {
        o_.troll.updateCooldowns()
        o_.troll.rageStartCheck()

        if (o_.troll.isEnraged) {
            await pause(1000)
            this.trollGoCrazy()
        } else {
            o_.characters.enableInteractivityAll()
            this.actionsMenu.show()
        }
    }

    async travellersTurn() {
        console.log('travellers Turn')
        this.actionsMenu.hide()

        if (this.getIsWin()) {
            return this.win();
        }

        o_.troll.rageStopCheck()

        o_.characters.disableInteractivityAll();

        const fighters = o_.characters.getFighters();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
            if (!o_.troll.getIsAlive()) break
        }

        eventBus.emit(Evt.BATTLE_TRAVELLERS_TURN_END)

        if (o_.troll.getIsAlive()) {
            this.trollTurn();
        } else {
            this.fail();
        }
    }

    fail() {
        eventBus.emit(Evt.BATTLE_DEFEAT, this.encounterDanger) // TODO danger level

        if (o_.characters.isVigilante) {
            o_.characters.getFighters()[0].say('Настал твой конец!')
            o_.characters.getFighters()[0].performFatality().then(() => {
                o_.characters.allTravelersGoAcrossBridge()
            })
            return
        }

        o_.characters.travellersTakeResourcesOnBridge().then(() => {
            o_.characters.allTravelersGoAcrossBridge()
            this.goToNextPhase(new PhaseBridge())
        })
    }

    win() {
        eventBus.emit(Evt.BATTLE_WON, this.encounterDanger)

        if (o_.characters.isKing) {
            // TODO win phase
            o_.game.gameWin('Отряд самого короля побежден. Теперь никто не посмеет перечить троллю!')
            return
        }

        if (this.encounterDanger !== EncounterDanger.LOW && this.encounterDanger !== EncounterDanger.NONE) {
            o_.troll.changeFear(trollConfig.FEAR_CHANGES.VICTORY)
        }

        console.log(`add ${this.xpForBattle} XP for battle of danger ${this.encounterDanger}`)
        o_.troll.addXp(this.xpForBattle)
        this.xpForBattle = 0

        o_.characters.getSquadChars().forEach(c => {
            if (c.state.key === CharStateKey.UNCONSCIOUS) {
                c.surrender(false)
            }
        })

        this.goToNextPhase(new PhaseActionsAfterBattleWon())
    }

    trollGoCrazy() {
        o_.troll.setEnraged(true)

        const travellers = o_.characters.getTravellers()
        const devourable = travellers.find(t => this.actionsMenu.actions.BATTLE_DEVOUR.getIsActive(t))
        if (devourable) return this.executeTrollBattleAction(TrollBattleAction.BATTLE_DEVOUR, devourable);

        const possibleActions: [TrollBattleAction, Char][] = []
        const trollAbilities = o_.troll.getCurrentAbilities()

        Object.values(this.actionsMenu.actions)
            .filter(a =>
                (a.abilityKey === undefined || trollAbilities.includes(a.abilityKey))
                &&
                (!a.getDisabledAndReason?.())
            )
            .map(btn => {

                travellers.forEach(t => {
                    if (btn.getIsActive(t)) {
                        possibleActions.push([btn.key, t])
                    }
                })
            })

        const [action, char] = getRndItem(possibleActions)
        this.executeTrollBattleAction(action, char)
    }

    async defendAgainstHit(char: Char, defender: Char, trollAttackAction: (char: Char) => Promise<any>) {
        await Promise.all([defender.goDefend(char), o_.troll.moveToDefenderOfChar(char)])

        await trollAttackAction(defender)
        if (this.getIsWin()) return this.win()

        const allGoBack = [] as Promise<any>[]
        if (defender.getIsAbleToFight()) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }

    async defendAgainstThrow(char: Char, defender: Char, trollAttackAction: (char: Char) => Promise<any>) {
        await Promise.all([defender.goDefend(char), trollAttackAction(defender)])

        if (this.getIsWin()) {
            return this.win()
        }

        const allGoBack = [] as Promise<any>[]
        if (defender.getIsAbleToFight()) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }
}