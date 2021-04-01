import {CharKey, EncounterDanger, Resources} from "../types";
import i18next from "i18next";
import {charTemplates} from "../char-templates";
import {createId} from "../utils/utils-misc";
import {renderManager} from "./render-manager";
import {bridgeManager} from "./bridge-manager";
import {gameState} from "../game-state";

class Char {
    key: CharKey
    id: string
    hp: number
    name: string
    isCombatant: boolean

    resources: Resources
    isUnconscious: boolean = false
    isAlive: boolean = true

    constructor(key: CharKey, x: number, y: number) {
        const charTemplate = charTemplates[key]

        this.id = createId(key);
        this.key = key
        this.hp = charTemplate.hp
        this.name = charTemplate.name
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant

        this.createAnimation(x, y);
    }

    createAnimation(x: number, y: number) {
        const a = renderManager.createAnimation({
            path: charTemplates[this.key].animationsPath,
            animationSpeed: 0.1,
            currentAnimation: 'walk',
            entityId: this.id,
            x: x,
            y: y,
            ySorting: true,
            autoplay: true,
            anchor: {x: 0.5, y: 1}
        })
        console.log(123123, a);
    }

    destroy() {
        renderManager.destroyAnimation(this.id);
    }
}

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
    }

    getDangerLevel() {
        if (this.encounterLevel === null) return 0
        return gameState.troll.level - this.encounterLevel;
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
}

export const charManager = new CharManager();

// @ts-ignore
window.charManager = charManager;