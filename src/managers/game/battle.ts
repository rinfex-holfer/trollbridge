import {eventBus, Evt} from "../../event-bus";
import {o_} from "../locator";
import {onEncounterEnd} from "../../helpers";
import {pause} from "../../utils/utils-async";
import {Char} from "../../entities/char/char";
import {getRndItem, rndBetween} from "../../utils/utils-math";
import {BattleActionsMenu} from "../../interface/battle-actions-menu";
import {AfterBattleActionsMenu} from "../../interface/after-battle-actions-menu";
import {battleConfig} from "../../configs/battle-config";
import {getGameSize} from "../../utils/utils-misc";
import {MeatLocation} from "../../entities/items/meat/meat";
import {GoldLocation} from "../../entities/items/gold";

import {ItemType} from "../../entities/items/types";
import {SaveData} from "../save-manager";

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

    xpForBattle = 0

    startBattle() {
        this.isBattle = true;

        const fighters = o_.characters.getFighters();
        if (fighters.length === 0) {
            return o_.characters.allSurrender();
        }

        const sub = eventBus.on(Evt.TROLL_TURN_END, () => this.travellersTurn());
        this.unsub.push(() => eventBus.unsubscribe(Evt.TROLL_TURN_END, sub));

        eventBus.emit(Evt.BATTLE_STARTED)

        this.xpForBattle = o_.troll.getXpForSquad(fighters.map(f => f.key))

        o_.characters.startFighting();

        pause(1000).then(() => this.trollTurn())
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

    getIsWin() {
        const fighters = o_.characters.getFighters();
        return fighters.length === 0
    }

    fail() {
        if (this.isBattle) eventBus.emit(Evt.BATTLE_DEFEAT, o_.negotiations.danger)

        this.onBattleEnd()

        if (o_.characters.isVigilante) {
            o_.characters.getFighters()[0].say('Настал твой конец!')
            o_.characters.getFighters()[0].performFatality().then(() => {
                o_.characters.letAllTravellersPass()
            })
            return
        }

        o_.characters.travellersTakeResourcesOnBridge().then(() => {
            o_.characters.letAllTravellersPass()
            onEncounterEnd()
        })
    }

    win() {
        if (this.isBattle) eventBus.emit(Evt.BATTLE_WON, o_.negotiations.danger)

        this.onBattleEnd()

        if (o_.characters.isKing) {
            o_.game.gameWin('Отряд самого короля побежден. Теперь никто не посмеет перечить троллю!')
            return
        }
        this.afterBattleMenu.show()

        o_.troll.addXp(this.xpForBattle)
        this.xpForBattle = 0
    }

    onBattleEnd() {
        eventBus.emit(Evt.BATTLE_END)
        this.actionsMenu.hide()
        o_.troll.setEnraged(false)

        this.isBattle = false;
        this.unsub.forEach(u => u())
    }

    onBridgeDestroyed() {
        const gameSize = getGameSize()
        this.actionsMenu.hide()
        o_.render.moveTo(o_.troll.container, {x: o_.troll.container.x, y: gameSize.height + 100}, rndBetween(400, 600))

        o_.characters.getTravellers().forEach(t => o_.render.moveTo(t.container, {
            x: t.container.x,
            y: gameSize.height + 100
        }, rndBetween(400, 600)))
        o_.items.get(ItemType.MEAT).filter(m => m.location === MeatLocation.GROUND).forEach(m => m.destroy())
        o_.items.get(ItemType.GOLD).filter(m => m.location === GoldLocation.GROUND).forEach(m => m.destroy())
    }

    async trollThrowRock(char: Char) {
        o_.characters.disableInteractivityAll();

        const defender = o_.characters.squad.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstThrow(char, defender, c => o_.troll.throwRockAt(c))
        } else {
            await o_.troll.throwRockAt(char)

            const gameOver = o_.bridge.checkDestruction()
            if (gameOver) return this.onBridgeDestroyed()

            if (this.getIsWin()) {
                return this.win()
            }
            await o_.troll.goToBattlePosition()
        }

        o_.troll.directToTarget(char.container)

        return this.travellersTurn()
    }

    trollGoCrazy() {
        o_.troll.setEnraged(true)

        const travellers = o_.characters.getTravellers()
        const devourable = travellers.find(t => this.actionsMenu.actions.BATTLE_DEVOUR.getIsActive(t))
        if (devourable) return this.trollGoDevour(devourable)

        const possibleActions = [] as (() => void)[]
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
                        possibleActions.push(() => btn.execute(t))
                    }
                })
            })

        return getRndItem(possibleActions)()
    }

    async trollGoAttack(char: Char) {
        o_.characters.disableInteractivityAll();

        const counterAttack = char.rollCounterAttack()
        const isEvaded = char.rollEvade()
        const defender = o_.characters.getDefenderOf(char)

        if (defender) {
            await this.defendAgainstHit(char, defender, (char) => o_.troll.attack(char))
        } else if (isEvaded) {
            await o_.troll.moveToChar(char)
            await char.evade()
            await Promise.all([o_.troll.goToBattlePosition(), char.goToBattlePosition()])
        } else if (counterAttack) {
            await o_.troll.moveToChar(char)
            await o_.characters.counterAttack(char.id)
            await pause(500)
            if (!o_.troll.getIsAlive()) return this.fail()
            await o_.troll.attack(char)
            if (this.getIsWin()) return this.win()
            await o_.troll.goToBattlePosition()
        } else {
            await o_.troll.moveToChar(char)
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

        const counterAttack = char.rollCounterAttack(battleConfig.COUNTER_ATTACK_AGAINST_GRAPPLE_BONUS)
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
        if (defender.getIsAbleToFight()) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }

    async defendAgainstThrow(char: Char, defender: Char, trollAttackAction: (char: Char) => Promise<any>) {
        await Promise.all([defender.goDefend(char), trollAttackAction(defender)])

        const gameOver = o_.bridge.checkDestruction()
        if (gameOver) return this.onBridgeDestroyed()

        if (this.getIsWin()) {
            return this.win()
        }

        const allGoBack = [] as Promise<any>[]
        if (defender.getIsAbleToFight()) allGoBack.push(defender.goToBattlePosition())
        allGoBack.push(o_.troll.goToBattlePosition())
        await Promise.all(allGoBack)
    }

    reset(saveData?: SaveData) {
        // TODO
    }
}