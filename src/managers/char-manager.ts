import {CharKey, EncounterDanger} from "../types";
import {bridgeManager} from "./bridge-manager";
import {gameState} from "../game-state";
import {rndBetween} from "../utils/utils-math";
import {constants} from "../constants";
import {trollManager} from "./troll-manager";
import {Char} from "../char/Char";

class CharManager {
    travellers: Char[] = []
    prisoners: Char[] = []
    dead: Char[] = []

    encounterLevel: number = 0;

    createTravellers(keys: CharKey[], travellersLevel: number) {
        this.encounterLevel = travellersLevel;
        console.log(keys);
        keys.forEach((key, i) => {
            const bridgePos = bridgeManager.getBridgePosition()
            const char = new Char(
                key,
                bridgePos.x + bridgePos.width - 50,
                bridgePos.y + 100 + i * 100
            );
            this.travellers.push(char);
        })
    }

    clearTravellers() {
        this.encounterLevel = 0;
        this.travellers.forEach(t => t.destroy());
        this.travellers = [];
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

    makeAllTravellersGo() {
        this.clearTravellers();
    }

    makeAllTravellersPay() {
        this.travellers.forEach(t => t.pay());
    }

    makeAllTravellersGiveAll() {
        this.travellers.forEach(t => t.giveAll());
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
                damage = rndBetween(2, constants.MAX_HP[gameState.troll.level] * 0.33)
                break;
            case EncounterDanger.HIGH:
                damage = rndBetween(2, constants.MAX_HP[gameState.troll.level] * 0.66)
                break;
            case EncounterDanger.VERY_HIGH:
                damage = rndBetween(2, constants.MAX_HP[gameState.troll.level] * 0.99)
                break;
            case EncounterDanger.IMPOSSIBLE:
                damage = constants.MAX_HP[gameState.troll.level];
                break;
        }

        if (damage > 0) trollManager.changeTrollHp(-damage, 'battle');

        if (gameState.gameover) return;

        this.makeAllTravellersGiveAll();
        this.clearTravellers();
    }
}

export const charManager = new CharManager();

// @ts-ignore
window.charManager = charManager;