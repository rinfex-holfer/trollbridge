import {dangerKey} from "./encounter";
import {EncounterDanger} from "../types";
import {rndBetween} from "../utils-math";
import {constants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {trollManager} from "./troll";

export function battle() {
    console.log('onBattle');

    let damage = 0;
    switch (dangerKey()) {
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

    console.log('dangerCode was', dangerKey());
    console.log('damage taken', damage);

    if (damage > 0) trollManager.changeTrollHp(-damage, 'battle');

    if (gameState.gameover) return;

    console.log('victory');

    eventBus.emit(Evt.ALL_GIVEN)
    eventBus.emit(Evt.BYPASSED)
    trollManager.goToLair()
}