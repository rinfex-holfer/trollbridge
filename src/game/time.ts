import {TimeOrder} from "../constants";
import {gameState} from "../game-state";
import {createRandomEncounter} from "./encounter";
import {eventBus, Evt} from "../event-bus";

export const timeManager = {
    wait: function() {
        const timeIndex = TimeOrder.indexOf(gameState.time);
        if (timeIndex === TimeOrder.length - 1) {
            gameState.day = gameState.day + 1;
            gameState.time = TimeOrder[0];
        } else {
            gameState.time = TimeOrder[timeIndex + 1];
        }

        eventBus.emit(Evt.TIME_PASSED);
    }
}