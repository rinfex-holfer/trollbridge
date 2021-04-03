import {CharKey, EncounterDanger} from "../types";
import {bridgeManager} from "./bridge-manager";
import {gameState} from "../game-state";
import {rndBetween} from "../utils/utils-math";
import {gameConstants} from "../constants";
import {trollManager} from "./troll-manager";
import {Char} from "../char/Char";
import {eventBus, Evt} from "../event-bus";

class CharManager {
    chars: Char[] = []

    encounterLevel: number = 0;

    constructor() {
        eventBus.on(Evt.CHAR_LEFT_BRIDGE, charId => this.onCharLeftBridge(charId))
        eventBus.on(Evt.TIME_PASSED, () => {
            this.chars.forEach(t => {
                if (t.isPrisoner) t.timeWithoutFood++
            })
        })
    }

    update(dt: number) {
        this.chars.forEach(t => t.update(dt));
    }

    onCharLeftBridge(charId: string) {
        const traveller = this.chars.find(t => t.id === charId);
        if (!traveller) {
            console.error('no char with id ' + charId);
            return;
        }

        this.removeChar(charId);
    }

    charToBones(id: string) {
        const idx = this.chars.findIndex(t => t.id === id)
        if (idx === undefined) {
            console.error('no char with id ' + id)
            return;
        }

        this.chars[idx].toBones();
    }

    removeChar(id: string) {
        const idx = this.chars.findIndex(t => t.id === id)
        if (idx === undefined) {
            console.error('no char with id ' + id)
            return;
        }

        this.chars[idx].destroy();
        this.chars.splice(idx, 1);
    }

    createTravellers(keys: CharKey[], travellersLevel: number) {
        this.encounterLevel = travellersLevel;
        keys.forEach((key, i) => {
            const bridgePos = bridgeManager.getBridgePosition()
            const char = new Char(
                key,
                bridgePos.x + bridgePos.width - 50,
                bridgePos.y + 150 + i * 150
            );
            char.goAcrossBridge();
            this.chars.push(char);
        })
    }

    getDangerKey() {
        if (this.encounterLevel === 0) return EncounterDanger.NONE;
        const diff = gameState.troll.level - this.encounterLevel;

        if (diff > 1) return EncounterDanger.LOW;
        else if (diff === 1) return EncounterDanger.LOW;
        else if (diff === 0) return EncounterDanger.MEDIUM;
        else if (diff === -1) return EncounterDanger.HIGH;
        else if (diff === -2) return EncounterDanger.VERY_HIGH;
        else return EncounterDanger.IMPOSSIBLE;
    }

    travellersSpeak(text: string) {
        return this.getTravellers()[0].speak(text);
    }

    getNewTravellers() {
        return this.getTravellers().filter(t => !t.isMetTroll);
    }

    getTravellers() {
        return this.chars.filter(c => c.isAlive && !c.isPrisoner)
    }

    getPrisoners() {
        return this.chars.filter(c => c.isAlive && c.isPrisoner);
    }

    stopAllTravellers() {
        this.getNewTravellers().forEach(t => t.startNegotiation());
    }

    allSurrender() {
        this.getTravellers().forEach(t => t.surrender());
    }

    letAllTravellersPass() {
        this.getTravellers().forEach(t => t.goAcrossBridge());
    }

    makeAllTravellersPay() {
        this.getTravellers().forEach(t => t.pay());
    }

    makeAllTravellersGiveAll() {
        this.getTravellers().forEach(t => t.giveAll());
    }

    releaseChar(id: string) {
        this.chars.find(t => t.id === id)?.goAcrossBridge();
    }

    makeImprisoned(id: string) {
        this.chars.find(t => t.id === id)?.makeImprisoned();
    }

    makeCharGiveAll(id: string) {
        this.getTravellers().find(t => t.id === id)?.giveAll();
    }

    makeCharPay(id: string) {
        this.getTravellers().find(t => t.id === id)?.pay();
    }

    killChar(id: string) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.kill();
    }

    feedChar(id: string) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.eat();
    }

    battle() {
        let damage = 0;
        const dangerKey = this.getDangerKey();
        switch (dangerKey) {
            case EncounterDanger.NONE:
                break;
            case EncounterDanger.LOW:
                damage = rndBetween(0, 2);
                break;
            case EncounterDanger.MEDIUM:
                damage = rndBetween(2, gameConstants.MAX_HP[gameState.troll.level] * 0.33)
                break;
            case EncounterDanger.HIGH:
                damage = rndBetween(2, gameConstants.MAX_HP[gameState.troll.level] * 0.66)
                break;
            case EncounterDanger.VERY_HIGH:
                damage = rndBetween(2, gameConstants.MAX_HP[gameState.troll.level] * 0.99)
                break;
            case EncounterDanger.IMPOSSIBLE:
                damage = gameConstants.MAX_HP[gameState.troll.level];
                break;
        }

        if (damage > 0) trollManager.changeTrollHp(-damage, 'battle');

        if (gameState.gameover) return;

        this.allSurrender();
        // this.makeAllTravellersGiveAll();
        // this.clearTravellers();
    }
}

export const charManager = new CharManager();

// @ts-ignore
window.charManager = charManager;