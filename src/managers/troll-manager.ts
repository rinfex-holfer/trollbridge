import {gameConstants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {render} from "./render";
import {resoursePaths} from "../resourse-paths";
import {lair} from "./lair";
import {TrollLocation} from "../types";
import {charManager} from "./characters";
import {positioner} from "./positioner";

eventBus.on(Evt.TIME_PASSED, () => trollManager.increaseHunger());

class TrollManager {
    containerId = 'troll'

    location: TrollLocation = TrollLocation.LAIR

    initTroll() {
        const pos = positioner.getLairPosition();
        render.createAnimation({
            entityId: this.containerId,
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

    eat(amount = 1) {
        gameState.troll.hunger = Math.max(gameState.troll.hunger - amount * 2, 0);
        this.changeTrollHp(amount);
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
        if (this.location === TrollLocation.BRIDGE) return;

        this.location = TrollLocation.BRIDGE;

        const bridgePos = positioner.bridgePosition();
        render.getContainer(this.containerId).x = bridgePos.x + bridgePos.width / 2
        render.getContainer(this.containerId).y = bridgePos.y + bridgePos.height / 2

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.BRIDGE);
    }

    goToLair() {
        if (this.location === TrollLocation.LAIR) return;
        this.location = TrollLocation.LAIR;

        const lairPos = positioner.getLairPosition();
        render.getContainer(this.containerId).x = lairPos.x + lairPos.width / 2
        render.getContainer(this.containerId).y = lairPos.y + lairPos.height / 2

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);
    }

    devour(id: string) {
        this.eat(3);
        charManager.charToBones(id);
    }
}

export const trollManager = new TrollManager();