import {gameConstants} from "../constants";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {AnimatedSprite} from "./render";
import {TrollLocation} from "../types";
import {characters} from "./characters";
import {positioner} from "./positioner";
import {CharAnimation} from "../char/char-constants";
import {rndBetween} from "../utils/utils-math";
import {bridgeManager} from "./bridge-manager";
import {lair} from "./lair";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    hp = 1
    armor = 0
    level = 1

    sprite: AnimatedSprite

    constructor() {
        troll = this;
        const pos = positioner.getLairPosition();
        this.sprite = new AnimatedSprite({
            atlasKey: 'troll',
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.STRIKE, repeat: -1, frameRate: 4},
            ],
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2,
        })
        this.sprite.addPhysics();
        this.setAnimation(CharAnimation.WALK)
        this.onNewLevel();

        eventBus.on(Evt.TIME_PASSED, () => this.increaseHunger());

        bridgeManager.enableInterface();

        bridgeManager.onClick = () => {
            if (this.location !== TrollLocation.BRIDGE) this.goToBridge()
        }
        lair.onClick = () => {
            if (this.location !== TrollLocation.LAIR) this.goToLair()
        }

        eventBus.on(Evt.ENCOUNTER_STARTED, () => {
            bridgeManager.disableInterface()
            lair.disableInterface()
        })
        eventBus.on(Evt.ENCOUNTER_ENDED, () => {
            if (this.location !== TrollLocation.BRIDGE) bridgeManager.enableInterface()
            if (this.location !== TrollLocation.LAIR) lair.enableInterface()
        })
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
            // this.changeTrollHp(-gameConstants.HP_MINUS_WHEN_HUNGRY, 'hunger')
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
        console.log(this.sprite)
        this.sprite.play(key);
    }

    goToBridge() {
        if (this.location === TrollLocation.BRIDGE) return;

        this.location = TrollLocation.BRIDGE;

        const bridgePos = positioner.bridgePosition();
        this.sprite.move(bridgePos.x + bridgePos.width / 2, bridgePos.y + bridgePos.height / 2)

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.BRIDGE);

        lair.enableInterface();
        bridgeManager.disableInterface();
    }
    //
    goToLair() {
        if (this.location === TrollLocation.LAIR) return;
        this.location = TrollLocation.LAIR;

        const lairPos = positioner.getLairPosition();
        this.sprite.move(lairPos.x + lairPos.width / 2, lairPos.y + lairPos.height / 2)

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);

        lair.disableInterface();
        bridgeManager.enableInterface();
    }

    devour(id: string) {
        this.eat(3);
        characters.charEaten(id);
    }

    getHit(dmg: number) {
        if (dmg > this.armor + rndBetween(1, 5)) {
            // console.log(this.container);
            // particleManager.createHitBurst(
            //     this.containerId,
            //     this.container.x,
            //     this.container.y - this.container.height / 2
            // )
            //
            // audioManager.playSound(SOUND_KEY.HIT);
            // this.changeTrollHp(-dmg, 'battle');
            //
            // flyingStatusChange(
            //     '-'+dmg,
            //     this.container.x,
            //     this.container.y - this.container.height,
            //     colors.RED
            // );
        } else {
            // audioManager.playSound(SOUND_KEY.BLOCK);
            //
            // particleManager.createBlockBurst(
            //     this.containerId,
            //     this.container.x + this.container.width / 2,
            //     this.container.y - this.container.height / 2
            // )
            //
            // flyingStatusChange('blocked', this.container.x, this.container.y - 100, colors.WHITE);
        }
    }

    rollDmg() {
        return gameConstants.TROLL_DMG[this.level] + rndBetween(1, 5)
    }
}

export const getTroll = () => {
    return troll;
}