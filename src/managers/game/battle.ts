import {eventBus, Evt} from "../../event-bus";
import {o_} from "../locator";
import {onEncounterEnd} from "../../helpers";

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

        o_.characters.startFighting();
        this.trollTurn();
    }

    trollTurn() {
        o_.characters.enableInteractivityOnBridge();
    }

    async travellersTurn() {
        if (this.getIsWin()) {
            return this.win();
        }

        o_.characters.disableInteractivityAll();

        const fighters = o_.characters.getFighters();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
        }

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
        this.onBattleEnd();
    }

    onBattleEnd() {
        o_.characters.enableInteractivityOnBridge();
        this.isBattle = false;
        this.unsub.forEach(u => u())
        onEncounterEnd();
    }

    async trollThrowRock(charId: string) {
        o_.characters.disableInteractivityAll();
        const char = o_.characters.getTraveller(charId)

        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            const defender = defenders[0]

            const throwing = [defender.goDefend(char), o_.troll.throwRockAt(defender)]
            await Promise.all(throwing)

            if (this.getIsWin()) return this.win()

            const allGoBack = [] as Promise<any>[]
            if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
            allGoBack.push(o_.troll.goToBattlePosition())
            await Promise.all(allGoBack)
        } else {
            await o_.troll.throwRockAt(char)
            if (this.getIsWin()) return this.win()
            await o_.troll.goToBattlePosition()
        }

        o_.troll.directToTarget(char.container)

        return this.travellersTurn()
    }

    async trollGoAttack(charId: string) {
        o_.characters.disableInteractivityAll();

        const char = o_.characters.getTraveller(charId)
        const counterAttack = o_.characters.canCounterAttack(charId)
        const defenders = o_.characters.findDefenders(charId)

        if (defenders.length) {
            const defender = defenders[0]

            const goToClash = [defender.goDefend(char), o_.troll.goToDefenderOfChar(charId)]
            await Promise.all(goToClash)

            await o_.troll.attack(defender.id)
            if (this.getIsWin()) return this.win()

            const allGoBack = [] as Promise<any>[]
            if (defender.isAlive) allGoBack.push(defender.goToBattlePosition())
            allGoBack.push(o_.troll.goToBattlePosition())
            await Promise.all(allGoBack)
        } else if (char.isMounted) {
            o_.troll.goToChar(charId)
            await char.runAround()

            char.directToTarget(o_.troll)
            await o_.troll.goToBattlePosition()
        } else {
            await o_.troll.goToChar(charId)

            if (counterAttack) await o_.characters.counterAttack(charId)
            if (!o_.troll.getIsAlive()) return this.fail()

            await o_.troll.attack(charId)
            if (this.getIsWin()) return this.win()

            await o_.troll.goToBattlePosition()
        }

        const fighters = o_.characters.getFighters()
        o_.troll.directToTarget(fighters[0].container)

        return this.travellersTurn()
    }

}