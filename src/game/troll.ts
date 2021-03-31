import {constants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {createRandomEncounter} from "./encounter";

eventBus.on(Evt.TIME_PASSED, () => trollManager.increaseHunger());

export const trollManager = {
    increaseHunger(val: number = constants.HUNGER_PER_TIME) {
        const newHunger = gameState.troll.hunger + val;
        if (newHunger > constants.MAX_HUNGER) {
            trollManager.changeTrollHp(-constants.HP_MINUS_WHEN_HUNGRY, 'hunger')
        }

        gameState.troll.hunger = Math.min(newHunger, constants.MAX_HUNGER);

        eventBus.emit(Evt.TROLL_STATS_CHANGED);
    },

    eat() {
        if (gameState.troll.hunger >= 2 && gameState.food > 0) {
            gameState.food--;
            gameState.troll.hunger -= 2;
            trollManager.changeTrollHp(1);
            console.log('Поел');
            eventBus.emit(Evt.TROLL_STATS_CHANGED);
        }
    },

    changeTrollHp(val: number, cause = 'hunger') {
        const newVal = gameState.troll.hp + val;
        gameState.troll.hp = Math.max(Math.min(newVal, constants.MAX_HP[gameState.troll.level]), 0);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        if (gameState.troll.hp === 0 && !gameState.gameover) {
            gameState.gameover = cause;
            eventBus.emit(Evt.GAME_OVER);
        }
    },

    goToBridge() {
        if (gameState.troll.location === 'bridge') return;

        gameState.troll.location = 'bridge';
        eventBus.emit(Evt.TROLL_LOCATION_CHANGED);
    },

    goToLair() {
        if (gameState.troll.location === 'lair') return;
        gameState.troll.location = 'lair';
        eventBus.emit(Evt.TROLL_LOCATION_CHANGED);
    }
}