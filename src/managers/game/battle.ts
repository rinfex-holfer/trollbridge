import {eventBus, Evt} from "../../event-bus";
import {o_} from "../locator";
import {onEncounterEnd} from "../../helpers";
import {pause} from "../../utils/utils-async";
import {Char} from "../../entities/char/Char";
import {actionButtonsMap, CharAction} from "../../interface/char-actions-menu";
import {getRndItem} from "../../utils/utils-math";

export class BattleManager {
    unsub: any[] = []

    isBattle = false

    constructor() {
        o_.register.battle(this);
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
        }
        else o_.characters.enableInteractivityOnBridge();
    }

    async travellersTurn() {
        if (this.getIsWin()) {
            return this.win();
        }

        o_.troll.rageStopCheck()

        o_.characters.disableInteractivityAll();

        const fighters = o_.characters.getFighters();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
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
    }

    win() {
        if (this.isBattle) eventBus.emit(Evt.BATTLE_WON)

        this.onBattleEnd();
    }

    onBattleEnd() {
        o_.troll.setEnraged(false)

        this.isBattle = false;
        this.unsub.forEach(u => u())

        onEncounterEnd();
    }

    async trollThrowRock(charId: string) {
        o_.characters.disableInteractivityAll();
        const char = o_.characters.getTraveller(charId)

        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            await this.defendAgainstThrow(char, defenders, c => o_.troll.throwRockAt(c))
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
        if (devourable) return this.trollGoDevour(devourable.id)

        const fighters = o_.characters.getFighters()
        const fightersWithActions: [Char, CharAction[]][] = fighters.map(f => {
            const actions = f.state.getPossibleTrollActions()
            return [f, actions.filter(a => {
                // do not try to hit mounted chard
                // if (f.isMounted &&
                //     (a === CharAction.BATTLE_HIT || a === CharAction.BATTLE_THROW_CHAR)
                // ) return false

                return true
            })]
        })

        const rndFighter = getRndItem(fightersWithActions)
        const rndAction = getRndItem(rndFighter[1])
        return actionButtonsMap[rndAction].onClick(rndFighter[0].id)
    }

    async trollGoAttack(charId: string) {
        o_.characters.disableInteractivityAll();

        const char = o_.characters.getTraveller(charId)
        const counterAttack = char.canCounterAttack()
        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            await this.defendAgainstHit(char, defenders, (char) => o_.troll.attack(char))
        } else if (char.isMounted) {
            if (o_.troll.isEnraged) {
                await o_.troll.jumpToChar(char)
                await o_.troll.attack(char)
                if (this.getIsWin()) return this.win()
                await o_.troll.jumpToBattlePosition()
            } else {
                o_.troll.goToChar(charId)
                await char.runAround()
                char.directToTarget(o_.troll)
                await o_.troll.goToBattlePosition()
            }
        } else {
            await o_.troll.moveToChar(char)

            if (counterAttack) {
                await o_.characters.counterAttack(charId)
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

    async trollGoThrowChar(charId: string) {
        o_.characters.disableInteractivityAll();

        const char = o_.characters.getTraveller(charId)
        const counterAttack = char.canCounterAttack()
        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            await this.defendAgainstHit(char, defenders, (char) => o_.troll.throwChar(char))
        } else {
            await o_.troll.moveToChar(char)

            if (counterAttack) {
                await o_.characters.counterAttack(charId)
                await pause(500)
                if (!o_.troll.getIsAlive()) return this.fail()
            }

            await o_.troll.throwChar(char)
            if (this.getIsWin()) return this.win()

            await o_.troll.goToBattlePosition()
        }

        return this.travellersTurn()
    }

    async trollGoDevour(charId: string) {
        o_.characters.disableInteractivityAll();
        const char = o_.characters.getTraveller(charId)
        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            await this.defendAgainstHit(char, defenders, (char) => o_.troll.attack(char))
        } else {
            await o_.troll.moveToChar(char)
            await o_.troll.devourAttack(charId)
        }

        if (!o_.troll.getIsAlive()) return this.fail()
        if (this.getIsWin()) return this.win()

        await o_.troll.goToBattlePosition()

        return this.travellersTurn()
    }

    async defendAgainstHit(char: Char, defenders: Char[], trollAttackAction: (char: Char) => Promise<any>) {
        const defender = defenders[0]

        await Promise.all([defender.goDefend(char), o_.troll.moveToDefenderOfChar(char)])

        await trollAttackAction(defender)
        if (this.getIsWin()) return this.win()

        const allGoBack = [] as Promise<any>[]
        if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }

    async defendAgainstThrow(char: Char, defenders: Char[], trollAttackAction: (char: Char) => Promise<any>) {
        const defender = defenders[0]

        await Promise.all([defender.goDefend(char), trollAttackAction(defender)])

        if (this.getIsWin()) return this.win()

        const allGoBack = [] as Promise<any>[]
        if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }
}