import {eventBus, Evt} from "../../event-bus";
import {o_} from "../locator";
import {onEncounterEnd} from "../../helpers";
import {pause} from "../../utils/utils-async";
import {Char} from "../../entities/char/char";
import {actionButtonsMap, CharAction} from "../../interface/char-actions-menu";
import {getRndItem} from "../../utils/utils-math";
import {BattleActionsMenu} from "../../interface/battle-actions-menu";
import {AfterBattleActionsMenu} from "../../interface/after-battle-actions-menu";

export class BattleManager {
    unsub: any[] = []

    isBattle = false

    actionsMenu: BattleActionsMenu
    afterBattleMenu: AfterBattleActionsMenu

    constructor() {
        o_.register.battle(this);
        this.actionsMenu = new BattleActionsMenu()
        this.afterBattleMenu = new AfterBattleActionsMenu()
    }

    startBattle() {
        this.isBattle = true;

        const fighters = o_.characters.getFighters();
        if (fighters.length === 0) {
            return o_.characters.allSurrender();
        }

        const sub = eventBus.on(Evt.TROLL_TURN_END, () => this.travellersTurn());
        this.unsub.push(() => eventBus.unsubscribe(Evt.TROLL_TURN_END, sub));

        eventBus.emit(Evt.BATTLE_STARTED)

        o_.characters.startFighting();
        this.trollTurn();
    }

    async trollTurn() {
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

    getIsWin() {
        const fighters = o_.characters.getFighters();
        return fighters.length === 0
    }

    fail() {
        this.onBattleEnd();
        o_.characters.letAllTravellersPass()
        onEncounterEnd()
    }

    win() {
        console.log('win')
        if (this.isBattle) eventBus.emit(Evt.BATTLE_WON)

        this.onBattleEnd()

        this.afterBattleMenu.show()
    }

    onBattleEnd() {
        this.actionsMenu.hide()
        o_.troll.setEnraged(false)

        this.isBattle = false;
        this.unsub.forEach(u => u())
    }

    async trollThrowRock(char: Char) {
        o_.characters.disableInteractivityAll();

        const defender = o_.characters.squad.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstThrow(char, defender, c => o_.troll.throwRockAt(c))
        } else {
            await o_.troll.throwRockAt(char)
            if (this.getIsWin()) return this.win()
            await o_.troll.goToBattlePosition()
        }

        o_.troll.directToTarget(char.container)

        return this.travellersTurn()
    }

    trollGoCrazy() {
        o_.troll.setEnraged(true)

        const travellers = o_.characters.getTravellers()
        const devourable = travellers.find(t => (t.isUnconscious && !t.isPrisoner) || (t.isSurrender && !t.isPrisoner))
        if (devourable) return this.trollGoDevour(devourable)

        const possibleActions = [] as (() => void)[]
        Object.values(this.actionsMenu.buttons).map(btn => {

            travellers.forEach(t => {
                if (btn.getIsActive(t)) {
                    possibleActions.push(() => btn.execute(t))
                }
            })
        })

        return getRndItem(possibleActions)()
    }

    async trollGoAttack(char: Char) {
        o_.characters.disableInteractivityAll();

        const counterAttack = char.canCounterAttack() && char.rollCounterAttack()
        const defender = o_.characters.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstHit(char, defender, (char) => o_.troll.attack(char))
        } else if (char.isMounted) {
            if (o_.troll.isEnraged) {
                await o_.troll.jumpToChar(char)
                await o_.troll.attack(char)
                if (this.getIsWin()) return this.win()
                await o_.troll.jumpToBattlePosition()
            } else {
                o_.troll.goToChar(char.id)
                await char.runAround()
                char.directToTarget(o_.troll)
                await o_.troll.goToBattlePosition()
            }
        } else {
            await o_.troll.moveToChar(char)

            if (counterAttack) {
                await o_.characters.counterAttack(char.id)
                await pause(500)
                if (!o_.troll.getIsAlive()) return this.fail()
            }

            await o_.troll.attack(char)
            if (this.getIsWin()) return this.win()

            await o_.troll.goToBattlePosition()
        }

        const fighters = o_.characters.getFighters()
        o_.troll.directToTarget(fighters[0].container)

        return this.travellersTurn()
    }

    async trollGoThrowChar(char: Char) {
        o_.characters.disableInteractivityAll();

        const counterAttack = char.canCounterAttack() && char.rollCounterAttack()
        const defender = o_.characters.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstHit(char, defender, (char) => o_.troll.throwChar(char))
        } else {
            await o_.troll.moveToChar(char)

            if (counterAttack) {
                await o_.characters.counterAttack(char.id)
                await pause(500)
                if (!o_.troll.getIsAlive()) return this.fail()
            }

            await o_.troll.throwChar(char)
            if (this.getIsWin()) return this.win()

            await o_.troll.goToBattlePosition()
        }

        return this.travellersTurn()
    }

    async trollGoDevour(char: Char) {
        o_.characters.disableInteractivityAll();
        const defender = o_.characters.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstHit(char, defender, (char) => o_.troll.attack(char))
        } else {
            await o_.troll.moveToChar(char)
            await o_.troll.devourAttack(char.id)
        }

        if (!o_.troll.getIsAlive()) return this.fail()
        if (this.getIsWin()) return this.win()

        await o_.troll.goToBattlePosition()

        return this.travellersTurn()
    }

    async defendAgainstHit(char: Char, defender: Char, trollAttackAction: (char: Char) => Promise<any>) {
        await Promise.all([defender.goDefend(char), o_.troll.moveToDefenderOfChar(char)])

        await trollAttackAction(defender)
        if (this.getIsWin()) return this.win()

        const allGoBack = [] as Promise<any>[]
        if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }

    async defendAgainstThrow(char: Char, defender: Char, trollAttackAction: (char: Char) => Promise<any>) {
        await Promise.all([defender.goDefend(char), trollAttackAction(defender)])

        if (this.getIsWin()) return this.win()

        const allGoBack = [] as Promise<any>[]
        if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }
}