import {colors, gameConstants} from "../../constants";
import {eventBus, Evt} from "../../event-bus";
import {TrollLocation} from "../../types";
import {positioner} from "./positioner";
import {CharAnimation} from "../../char/char-constants";
import {rndBetween} from "../../utils/utils-math";
import {flyingStatusChange} from "../../interface/basic/flying-status-change";
import {O_AnimatedSprite} from "../core/render/animated-sprite";
import {o_} from "../locator";
import {SOUND_KEY} from "../core/audio";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    hp = 1
    armor = 0
    level = 1
    hunger = 0

    sprite: O_AnimatedSprite

    constructor() {
        o_.register.troll(this)

        troll = this;
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createAnimatedSprite({
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

        o_.bridge.enableInterface();

        o_.bridge.onClick = () => {
            if (this.location !== TrollLocation.BRIDGE) this.goToBridge()
        }
        o_.lair.onClick = () => {
            if (this.location !== TrollLocation.LAIR) this.goToLair()
        }

        eventBus.on(Evt.TROLL_LOCATION_CHANGED, (loc) => {
            if (loc !== TrollLocation.BRIDGE) o_.bridge.enableInterface()
            if (loc !== TrollLocation.LAIR) o_.lair.enableInterface()
        })
        eventBus.on(Evt.ENCOUNTER_STARTED, () => {
            o_.bridge.disableInterface()
            o_.lair.disableInterface(true)
        })
        eventBus.on(Evt.ENCOUNTER_ENDED, () => {
            if (this.location !== TrollLocation.BRIDGE) o_.bridge.enableInterface()
            if (this.location !== TrollLocation.LAIR) o_.lair.enableInterface()
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
        const newHunger = this.hunger + val;
        if (newHunger > gameConstants.MAX_HUNGER) {
            // this.changeTrollHp(-gameConstants.HP_MINUS_WHEN_HUNGRY, 'hunger')
        }

        this.hunger = Math.min(newHunger, gameConstants.MAX_HUNGER);

        eventBus.emit(Evt.TROLL_STATS_CHANGED);
    }

    eat(amount = 1) {
        this.hunger = Math.max(this.hunger - amount * 2, 0);
        this.changeTrollHp(amount);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        eventBus.emit(Evt.RESOURSES_CHANGED);
    }

    changeTrollHp(val: number, cause = 'hunger') {
        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, gameConstants.MAX_TROLL_HP[this.level]), 0);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        if (this.hp === 0) {
            o_.game.gameOver(cause);
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

        // lair.enableInterface();
        // _l.bridge.disableInterface();
    }
    //
    goToLair() {
        if (this.location === TrollLocation.LAIR) return;
        this.location = TrollLocation.LAIR;

        const lairPos = positioner.getLairPosition();
        this.sprite.move(lairPos.x + lairPos.width / 2, lairPos.y + lairPos.height / 2)

        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, TrollLocation.LAIR);

        // lair.disableInterface();
        // _l.bridge.enableInterface();
    }

    devour(id: string) {
        this.eat(3);
        o_.characters.charEaten(id);
    }

    getHit(dmg: number) {
        if (dmg > this.armor + rndBetween(1, 5)) {
            o_.render.burstBlood(
                this.sprite.x,
                this.sprite.y - this.sprite.height / 2
            )

            o_.audio.playSound(SOUND_KEY.HIT);
            this.changeTrollHp(-dmg, 'battle');

            flyingStatusChange(
                '-'+dmg,
                this.sprite.x,
                this.sprite.y - this.sprite.height,
                colors.RED
            );
        } else {
            o_.audio.playSound(SOUND_KEY.BLOCK);

            o_.render.burstBlood(
                this.sprite.x + this.sprite.width / 2,
                this.sprite.y - this.sprite.height / 2
            )

            flyingStatusChange('blocked', this.sprite.x, this.sprite.y - 100, colors.WHITE);
        }
    }

    rollDmg() {
        return gameConstants.TROLL_DMG[this.level] + rndBetween(1, 5)
    }
}