import {colorsCSS, gameConstants} from "../../../constants";
import {eventBus, Evt} from "../../../event-bus";
import {FoodType, TrollLocation} from "../../../types";
import {positioner} from "../positioner";
import {CharAnimation} from "../../../entities/char/char-constants";
import {clamp, rndBetween, Vec} from "../../../utils/utils-math";
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
import {O_Text} from "../../core/render/text";
import {TrollStats} from "../../../interface/troll-stats";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    armor = 0
    level = 1

    dmg = 1
    hp = 1
    maxHp = 1

    hunger = 0
    maxHunger = gameConstants.TROLL_MAX_HUNGER

    selfControl = gameConstants.TROLL_MAX_SELF_CONTROL
    maxSelfControl = gameConstants.TROLL_MAX_SELF_CONTROL

    xp = 0
    // might = 0
    // wealth = 0

    sprite: O_AnimatedSprite
    zzz: Zzz

    speed = gameConstants.TROLL_SPEED

    state: TrollState

    stats: TrollStats

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

        eventBus.on(Evt.TIME_PASSED, () => this.increaseHunger());

        o_.time.sub(dt => this.update(dt))

        this.state = this.getState(TrollStateKey.IDLE)
        this.state.onStart();

        this.stats = new TrollStats(this)
        this.hp = gameConstants.TROLL_LEVELING[this.level].maxHp
        this.onNewLevel(false);
    }

    get x() { return this.sprite.x }
    get y() { return this.sprite.y }

    onNewLevel(animated = true) {
        this.xp = 0
        this.maxHp = gameConstants.TROLL_LEVELING[this.level].maxHp
        this.armor = gameConstants.TROLL_LEVELING[this.level].armor
        this.dmg = gameConstants.TROLL_LEVELING[this.level].dmg

        this.stats.update(animated)
    }

    getNextLvlReqs() {
        return gameConstants.TROLL_LEVELING[this.level+1].xp
    }

    getIsAlive() {
        return this.hp > 0;
    }

    increaseHunger(val: number = gameConstants.HUNGER_PER_TIME) {
        if (this.hunger === gameConstants.TROLL_MAX_HUNGER) {
            this.changeTrollHp(-gameConstants.HP_MINUS_WHEN_HUNGRY, 'hunger')
        }

        this.changeHunger(val)
    }

    eat(food: FoodType, isStale: boolean = false, isHuman: boolean = false) {
        const minusHunger = isStale
            ? gameConstants.HUNGER_REDUCTION_FROM_STALE_FOOD[food]
            : gameConstants.HUNGER_REDUCTION_FROM_FOOD[food]
        const hpChange = isStale
            ? gameConstants.HP_FROM_STALE_FOOD[food]
            : gameConstants.HP_FROM_FOOD[food]

        this.changeHunger(-minusHunger)
        this.changeTrollHp(hpChange)
        o_.audio.playSound(SOUND_KEY.CHEW)
        eventBus.emit(Evt.TROLL_STATS_CHANGED)
    }

    changeHunger(val: number) {
        this.hunger = clamp(this.hunger + val, 0, 10)
        this.stats.update()
    }

    changeTrollHp(val: number, cause = 'hunger') {
        const sign = val < 0 ? '-' : '+'
        const color = val < 0 ? colorsCSS.RED : colorsCSS.GREEN
        flyingStatusChange(
            sign+val + ' hp',
            this.sprite.x,
            this.sprite.y - this.sprite.height,
            color
        );

        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, this.maxHp), 0);
        eventBus.emit(Evt.TROLL_STATS_CHANGED);
        if (this.hp === 0) {
            o_.game.gameOver(cause);
            this.setAnimation(CharAnimation.DEAD)
        }

        this.stats.update()
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
        this.eat(FoodType.NORMAL, false, true);
        o_.characters.charEaten(id);
    }

    getHit(dmg: number) {
        if (dmg > this.armor + rndBetween(1, 2)) {
            o_.render.burstBlood(
                this.sprite.x,
                this.sprite.y - this.sprite.height / 2
            )

            o_.audio.playSound(SOUND_KEY.HIT);
            this.changeTrollHp(-dmg, 'battle');
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
        this.directToTarget({x, y})
    }

    directToTarget(target: Vec) {
        o_.render.directToTarget(this.sprite, target);
    }

    rollDmg() {
        return this.dmg + rndBetween(1, 5)
    }

    stop() {
        this.sprite.stop()
    }

    update(dt: number) {
        this.state.update(dt)
    }

    addXp(val: number) {
        this.xp = Math.min(this.getNextLvlReqs(), this.xp + val)

        const isNewLevel = this.xp === this.getNextLvlReqs();
        this.stats.updateXp(true, isNewLevel).then(() => {
            if (isNewLevel) {
                this.level++
                this.onNewLevel()
            }
        })
    }
}