import {gameConstants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {render} from "./render";
import { resoursePaths } from "../resourse-paths";
import {lair} from "./lair";
import {bridgeManager} from "./bridge-manager";
import {Resources} from "../types";
import {encounter} from "./encounter";
import {charManager} from "./char-manager";

eventBus.on(Evt.TIME_PASSED, () => trollManager.increaseHunger());

class TrollManager {
    static CONTAINER_ID = 'troll'

    initTroll() {
        const pos = lair.getLairPosition();
        render.createAnimation({
            entityId: TrollManager.CONTAINER_ID,
            path: resoursePaths.atlases.troll,
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2,
            autoplay: true,
            animationSpeed: 0.10,
            currentAnimation: 'idle',
            anchor: {x: 0.5, y: 1}
        })
    }

    increaseHunger(val: number = gameConstants.HUNGER_PER_TIME) {
        const newHunger = gameState.troll.hunger + val;
        if (newHunger > gameConstants.MAX_HUNGER) {
            this.changeTrollHp(-gameConstants.HP_MINUS_WHEN_HUNGRY, 'hunger')
        }

        gameState.troll.hunger = Math.min(newHunger, gameConstants.MAX_HUNGER);

        eventBus.emit(Evt.TROLL_STATS_CHANGED);
    }

    eat() {
        // if (gameState.food <= 0) return;

        gameState.food--;
        gameState.troll.hunger = Math.max(gameState.troll.hunger - 2, 0);
        this.changeTrollHp(1);
        console.log('Поел');
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        eventBus.emit(Evt.RESOURSES_CHANGED);
    }

    changeTrollHp(val: number, cause = 'hunger') {
        const newVal = gameState.troll.hp + val;
        gameState.troll.hp = Math.max(Math.min(newVal, gameConstants.MAX_HP[gameState.troll.level]), 0);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        if (gameState.troll.hp === 0 && !gameState.gameover) {
            gameState.gameover = cause;
            eventBus.emit(Evt.GAME_OVER);
        }
    }

    goToBridge() {
        if (gameState.troll.location === 'bridge') return;

        gameState.troll.location = 'bridge';

        const bridgePos = bridgeManager.getBridgePosition();
        render.getContainer(TrollManager.CONTAINER_ID).x = bridgePos.x + bridgePos.width / 2
        render.getContainer(TrollManager.CONTAINER_ID).y = bridgePos.y + bridgePos.height / 2

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED);
    }

    goToLair() {
        if (gameState.troll.location === 'lair') return;
        gameState.troll.location = 'lair';

        const lairPos = lair.getLairPosition();
        render.getContainer(TrollManager.CONTAINER_ID).x = lairPos.x + lairPos.width / 2
        render.getContainer(TrollManager.CONTAINER_ID).y = lairPos.y + lairPos.height / 2

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED);
    }

    devour(id: string) {
        this.eat();
        this.changeTrollHp(3);
        charManager.removeChar(id);
    }
}

export const trollManager = new TrollManager();