import {EncounterDanger} from "../types";
import {rndBetween} from "../utils/utils-math";
import {gameConstants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {trollManager} from "./troll-manager";
import {charManager} from "./char-manager";

class BattleManager {

}

export const battleManager = new BattleManager();