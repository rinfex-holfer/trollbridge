import {EncounterDanger, EncounterTemplate, CharKey} from "../types";
import {getRndItem, rndBetween} from "../utils/utils-math";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {charManager} from "./char-manager";
import {encounterTemplates} from "../encounter-templates";

class EncounterManager {
    encounterFinished = true

    constructor() {
        eventBus.on(Evt.TIME_PASSED, () => this.createRandomEncounter());
    }

    createRandomEncounter() {
        // const rnd = rndBetween(Math.max(0, gameState.troll.level - 1), gameState.troll.level + 1);
        const rnd = 0;
        const encounter = getRndItem(encounterTemplates[rnd]);

        charManager.createTravellers([
            ...encounter.enemies,
            ...encounter.stuff,
            ...encounter.nonCombatants,
        ], encounter.level)

        this.encounterFinished = false;

        eventBus.emit(Evt.TRAVELLERS_APPEARS);
    }

    finishEncounter() {
        this.encounterFinished = true;
    }
}

export const encounter = new EncounterManager();

