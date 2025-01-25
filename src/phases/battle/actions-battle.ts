import {resoursePaths} from "../../resourse-paths";
import {TrollAbility} from "../../types";
import {Char} from "../../entities/char/char";
import {PhaseBattle} from "./phase-battle";
import {o_} from "../../managers/locator";
import {pause} from "../../utils/utils-async";
import {battleConfig} from "../../configs/battle-config";

export const enum TrollBattleAction {
    BATTLE_HIT = 'BATTLE_HIT',
    BATTLE_DEVOUR = 'BATTLE_DEVOUR',
    BATTLE_THROW_ROCK = 'BATTLE_THROW_ROCK',
    BATTLE_THROW_CHAR = 'BATTLE_THROW_CHAR',
}

type TrollBattleActionSpec = {
    key: TrollBattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    abilityKey?: TrollAbility,
    execute: (char: Char, battle: PhaseBattle) => Promise<void>
    getIsActive: (char: Char) => boolean
    getDisabledAndReason?: () => false | string
    getText?: () => string
}

export const TrollBattleActions: { [action in TrollBattleAction]: TrollBattleActionSpec } = {
    [TrollBattleAction.BATTLE_HIT]: {
        key: TrollBattleAction.BATTLE_HIT,
        text: 'Ударить',
        resource: 'button_strike',
        execute: async (char, battle: PhaseBattle) => {
            o_.characters.disableInteractivityAll();

            const counterAttack = char.rollCounterAttack()
            const isEvaded = char.rollEvade()
            const defender = o_.characters.getDefenderOf(char)

            if (defender) {
                await battle.defendAgainstHit(char, defender, (char) => o_.troll.attack(char))
            } else if (isEvaded) {
                await o_.troll.moveToChar(char)
                await char.evade()
                await Promise.all([o_.troll.goToBattlePosition(), char.goToBattlePosition()])
            } else if (counterAttack) {
                await o_.troll.moveToChar(char)
                await o_.characters.counterAttack(char.id)
                await pause(500)
                if (battle.getIsShouldEnd()) return
                await o_.troll.attack(char)
                if (battle.getIsShouldEnd()) return
                await o_.troll.goToBattlePosition()
            } else {
                await o_.troll.moveToChar(char)
                await o_.troll.attack(char)
                if (battle.getIsShouldEnd()) return
                await o_.troll.goToBattlePosition()
            }

            const fighters = o_.characters.getFighters()
            o_.troll.directToTarget(fighters[0].container)

            return;
        },
        getIsActive: char => char.hp > 0 && !char.getIsCovered() && !char.isSurrender,
        getText: () => {
            const dmg = o_.troll.getDmg()
            return `Ударить (${dmg[0]}-${dmg[1]})`
        }
    },

    [TrollBattleAction.BATTLE_THROW_ROCK]: {
        key: TrollBattleAction.BATTLE_THROW_ROCK,
        text: 'Метнуть камень',
        resource: 'button_throw_rock',
        abilityKey: TrollAbility.THROW_ROCK,
        execute: async (char, battle) => {
            o_.characters.disableInteractivityAll();

            const defender = o_.characters.squad.getDefenderOf(char)

            if (defender) {
                await battle.defendAgainstThrow(char, defender, c => o_.troll.throwRockAt(c))
            } else {
                await o_.troll.throwRockAt(char)

                if (battle.getIsShouldEnd()) return
                await o_.troll.goToBattlePosition()
            }

            o_.troll.directToTarget(char.container)

            return
        },
        getIsActive: char => char.hp > 0 && !(char.isUnconscious && char.getIsCovered()) && !char.isSurrender,
        getDisabledAndReason: () => o_.bridge.getHasAvailableRocks() ? false : 'нет камней, надо починить мост',
        getText: () => {
            const dmg = o_.troll.getDmg(false, true)
            return `Метнуть камень (${dmg[0]}-${dmg[1]})`
        }
    },

    [TrollBattleAction.BATTLE_THROW_CHAR]: {
        key: TrollBattleAction.BATTLE_THROW_CHAR,
        text: 'Бросить об землю',
        resource: 'button_throw_char',
        abilityKey: TrollAbility.GRAPPLE,
        execute: async (char, battle) => {
            o_.characters.disableInteractivityAll();

            const counterAttack = char.rollCounterAttack(battleConfig.COUNTER_ATTACK_AGAINST_GRAPPLE_BONUS)
            const defender = o_.characters.getDefenderOf(char)

            if (defender) {
                await battle.defendAgainstHit(char, defender, (char) => o_.troll.throwChar(char))
            } else {
                await o_.troll.moveToChar(char)

                if (counterAttack) {
                    await o_.characters.counterAttack(char.id)
                    await pause(500)
                    if (battle.getIsShouldEnd()) return;
                }

                await o_.troll.throwChar(char)
                if (battle.getIsShouldEnd()) return;

                await o_.troll.goToBattlePosition()
            }

            return
        },
        getIsActive: char => char.hp > 0 && !char.getIsCovered() && !char.isMounted && !char.isSurrender,
        getDisabledAndReason: () => o_.troll.grappleCooldown > 0 ? 'Cooldown: ' + o_.troll.grappleCooldown : false,
        getText: () => {
            const dmg = o_.troll.getDmg(true)
            return `Бросить об землю (${dmg[0]}-${dmg[1]})`
        }
    },

    [TrollBattleAction.BATTLE_DEVOUR]: {
        key: TrollBattleAction.BATTLE_DEVOUR,
        abilityKey: TrollAbility.MAN_EATER,
        text: 'Сожрать лежачего',
        resource: 'button_devour',
        execute: async (char, battle) => {
            o_.characters.disableInteractivityAll();
            const defender = o_.characters.getDefenderOf(char)

            if (defender) {
                await battle.defendAgainstHit(char, defender, (char) => o_.troll.attack(char))
            } else {
                await o_.troll.moveToChar(char)
                await o_.troll.devourAttack(char.id)
            }

            if (battle.getIsShouldEnd()) return;

            await o_.troll.goToBattlePosition()

            return;
        },
        getIsActive: char => char.isUnconscious && !char.getIsCovered()
    },
}