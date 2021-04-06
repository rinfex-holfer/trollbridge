import {colors, gameConstants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {render} from "./render";
import {resoursePaths} from "../resourse-paths";
import {TrollLocation} from "../types";
import {characters} from "./characters";
import {positioner} from "./positioner";
import {audioManager, SOUND_KEY} from "./audio";
import {CharAnimation} from "../char/char-constants";
import {rndBetween} from "../utils/utils-math";
import {particleManager} from "./particles";
import {Container} from "../type-aliases";
import {flyingStatusChange} from "../interface/basic/flying-status-change";

eventBus.on(Evt.TIME_PASSED, () => trollManager.increaseHunger());

class TrollManager {
    containerId = 'troll'

    // @ts-ignore
    container: Container

    location: TrollLocation = TrollLocation.LAIR

    hp = 1
    armor = 0
    level = 0

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

        this.container = render.getContainer(this.containerId);

        this.level = 1;
        this.onNewLevel();
    }

    onNewLevel() {
        this.hp = gameConstants.MAX_TROLL_HP[this.level]
        this.armor = gameConstants.TROLL_ARMOR[this.level]
    }

    getIsAlive() {
        return this.hp > 0;
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
        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, gameConstants.MAX_TROLL_HP[this.level]), 0);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        if (this.hp === 0 && !gameState.gameover) {
            gameState.gameover = cause;
            eventBus.emit(Evt.GAME_OVER);
            this.setAnimation(CharAnimation.DEAD)
        }
    }

    setAnimation(key: CharAnimation, onComplete?: () => void) {
        render.changeAnimation({
            entityId: this.containerId,
            animationName: key,
            onComplete
        })
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
        characters.charEaten(id);
    }

    getHit(dmg: number) {
        if (dmg > this.armor + rndBetween(1, 5)) {
            console.log(this.container);
            particleManager.createHitBurst(
                this.containerId,
                this.container.x,
                this.container.y - this.container.height / 2
            )

            audioManager.playSound(SOUND_KEY.HIT);
            this.changeTrollHp(-dmg, 'battle');

            flyingStatusChange(
                '-'+dmg,
                this.container.x,
                this.container.y - this.container.height,
                colors.RED
            );
        } else {
            audioManager.playSound(SOUND_KEY.BLOCK);

            particleManager.createBlockBurst(
                this.containerId,
                this.container.x + this.container.width / 2,
                this.container.y - this.container.height / 2
            )

            flyingStatusChange('blocked', this.container.x, this.container.y - 100, colors.WHITE);
        }
    }

    rollDmg() {
        return gameConstants.TROLL_DMG[this.level] + rndBetween(1, 5)
    }
}

export const trollManager = new TrollManager();