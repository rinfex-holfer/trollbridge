import {colorsCSS, gameConstants} from "../../../constants";
import {eventBus, Evt} from "../../../event-bus";
import {FoodType, MeatType, MiscFood, TrollLocation} from "../../../types";
import {positioner} from "../positioner";
import {CharAnimation} from "../../../entities/char/char-constants";
import {rndBetween, Vec} from "../../../utils/utils-math";
import {flyingStatusChange} from "../../../interface/basic/flying-status-change";
import {O_AnimatedSprite} from "../../core/render/animated-sprite";
import {o_} from "../../locator";
import {SOUND_KEY} from "../../core/audio";
import {TrollState, TrollStateKey} from "./troll-state";
import {TrollStateIdle} from "./troll-state-idle";
import {TrollIntention} from "./types";
import {TrollStateGoTo} from "./troll-state-go-to";
import {TrollStateSleep} from "./troll-state-sleep";
import {LayerKey} from "../../core/layers";
import {Zzz} from "../../../entities/zzz";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    hp = 1
    armor = 0
    level = 1
    hunger = 0

    sprite: O_AnimatedSprite
    zzz: Zzz

    speed = gameConstants.TROLL_SPEED

    state: TrollState

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
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)

        this.zzz = new Zzz(0, 0);

        this.onNewLevel();

        eventBus.on(Evt.TIME_PASSED, () => this.increaseHunger());

        o_.time.sub(dt => this.update(dt))

        this.state = this.getState(TrollStateKey.IDLE)
        this.state.onStart();
    }

    get x() { return this.sprite.x }
    get y() { return this.sprite.y }

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

    eat(food: FoodType) {
        const minusHunger = gameConstants.HUNGER_REDUCTION_FROM[food]
        const hpChange = gameConstants.HP_FROM[food]

        this.hunger = Math.max(this.hunger - minusHunger, 0);
        this.changeTrollHp(hpChange);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
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
        this.sprite.play(key);
    }

    getState(stateKey: TrollStateKey, options?: any): TrollState {
        switch (stateKey) {
            case TrollStateKey.IDLE:
                return new TrollStateIdle(this);
            case TrollStateKey.GO_TO:
                return new TrollStateGoTo(this, options);
            case TrollStateKey.SLEEP:
                return new TrollStateSleep(this);
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    setState(stateKey: TrollStateKey, options?: any) {
        console.log('new troll state:', stateKey);
        this.state.onEnd();
        this.state = this.getState(stateKey, options)
        this.state.onStart();
    }

    goToBridge() {
        this.setState(TrollStateKey.GO_TO, { intention: TrollIntention.BRIDGE })
    }
    goToLair() {
        this.setState(TrollStateKey.GO_TO, { intention: TrollIntention.LAIR })
    }

    goToBed() {
        this.setState(TrollStateKey.GO_TO, { intention: TrollIntention.BED })
    }

    goIdle() { this.setState(TrollStateKey.IDLE) }

    goSleep() { this.setState(TrollStateKey.SLEEP) }

    devour(id: string) {
        this.eat(MeatType.RAW);
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
                colorsCSS.RED
            );
        } else {
            o_.audio.playSound(SOUND_KEY.BLOCK);

            o_.render.burstBlood(
                this.sprite.x + this.sprite.width / 2,
                this.sprite.y - this.sprite.height / 2
            )

            flyingStatusChange('blocked', this.sprite.x, this.sprite.y - 100, colorsCSS.WHITE);
        }
    }

    moveTowards(x: number, y: number) {
        o_.render.moveTowards(
            this.sprite,
            x,
            y,
            this.speed,
        )
    }

    directToTarget(target: Vec) {
        o_.render.directToTarget(this.sprite, {x: target.x - this.sprite.x, y: target.y - this.sprite.y});
    }

    rollDmg() {
        return gameConstants.TROLL_DMG[this.level] + rndBetween(1, 5)
    }

    stop() {
        this.sprite.stop()
    }

    update(dt: number) {
        this.state.update(dt)
    }

    goTo(intention: TrollIntention) {

    }
}