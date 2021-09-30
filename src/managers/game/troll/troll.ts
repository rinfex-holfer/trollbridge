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
import {TrollStateGoTo} from "./troll-state-go-to";
import {TrollStateSleep} from "./troll-state-sleep";
import {LayerKey} from "../../core/layers";
import {Zzz} from "../../../entities/zzz";
import {TrollStats} from "../../../interface/troll-stats";
import {TrollStateBattleAttack} from "./troll-state-battle-attack";
import {onTrollCameToBridge, onTrollCameToLair, onTrollSleep} from "../../../helpers";
import {Char} from "../../../entities/char/Char";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import {Rock} from "../../../entities/rock";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    armor = 0
    level = 0
    dmg = 1
    hp = 1
    maxHp = 1
    hunger = 0
    maxHunger = gameConstants.TROLL_MAX_HUNGER
    selfControl = gameConstants.TROLL_MAX_SELF_CONTROL
    maxSelfControl = gameConstants.TROLL_MAX_SELF_CONTROL
    xp = 0

    sprite: O_AnimatedSprite
    zzz: Zzz

    speed = gameConstants.TROLL_SPEED

    state: TrollState

    stats: TrollStats

    notificationTimer: null | number = null

    constructor() {
        o_.register.troll(this)

        troll = this;
        const lairPos = positioner.getLairPosition();
        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'troll',
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.FALL, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DAMAGED, frameRate: 8},
                {framesPrefix: CharAnimation.STRIKE, frameRate: 8},
                {framesPrefix: CharAnimation.STRIKE_DOWN, frameRate: 4},
                {framesPrefix: CharAnimation.THROW_STONE, frameRate: 8},
                {framesPrefix: CharAnimation.UNCONSCIOUS, frameRate: 1},
            ],
            x: lairPos.x + lairPos.width / 2,
            y: lairPos.y + lairPos.height / 2,
        })
        this.sprite.setOrigin(0.5, 1);
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
        let foodKey = isHuman ? 'HUMAN' : 'ANIMAL';
        if (isStale) foodKey += '_STALE'

        // @ts-ignore
        const hpChange = gameConstants.FOOD[food][foodKey].hp
        // @ts-ignore
        const hungerChange = gameConstants.FOOD[food][foodKey].hunger
        // @ts-ignore
        const selfControlChange = gameConstants.FOOD[food][foodKey].selfControl
        // @ts-ignore
        const xpChange = gameConstants.FOOD[food][foodKey].xp

        this.changeTrollHp(hpChange)
        this.changeHunger(hungerChange)
        this.changeSelfControl(selfControlChange)
        this.addXp(xpChange)

        o_.audio.playSound(SOUND_KEY.CHEW)
        eventBus.emit(Evt.TROLL_STATS_CHANGED)
    }

    changeHunger(val: number) {
        this.statChangeNotification('Голод', val, true)

        this.hunger = clamp(this.hunger + val, 0, this.maxHunger)
        this.stats.update()
    }

    statChangeNotification(statStr: string, val: number, inverted?: boolean) {
        if (val === 0) return

        const sign = val < 0 ? '' : '+'
        const color = ((val < 0 && !inverted) || (val > 0 && inverted)) ? colorsCSS.RED : colorsCSS.GREEN

        const text = sign + val + ' ' + statStr;

        const x = this.sprite.x
        const y = this.sprite.y - this.sprite.height
        this.notificationsQueue.push([text, x, y, color])

        if (this.notificationTimer === null) {
            this.showNextNotification()
        }
    }

    notificationsQueue: [text: string, x: number, y: number, color: string][] = []

    showNextNotification() {
        const nextNotification = this.notificationsQueue.shift()
        if (nextNotification) {
            flyingStatusChange(nextNotification[0], nextNotification[1], nextNotification[2], nextNotification[3])

            this.notificationTimer = window.setTimeout(() => {
                this.showNextNotification()
            }, 700)
        }
        else {
            this.notificationTimer = null
        }
    }

    changeSelfControl(val: number) {
        this.statChangeNotification('самоконтроль', val)

        this.selfControl = clamp(this.selfControl + val, 0, this.maxSelfControl)
        this.stats.update()
    }

    changeTrollHp(val: number, cause = 'hunger') {
        this.statChangeNotification('HP', val)

        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, this.maxHp), 0);

        if (this.hp === 0) {
            o_.game.gameOver(cause)
            this.setAnimation(CharAnimation.DEAD)
        }

        this.stats.update()
    }

    setAnimation(key: CharAnimation, onComplete?: () => void) {
        this.sprite.play(key, {onComplete});
    }

    getState(stateKey: TrollStateKey, options?: any): TrollState {
        switch (stateKey) {
            case TrollStateKey.IDLE:
                return new TrollStateIdle(this);
            case TrollStateKey.GO_TO:
                return new TrollStateGoTo(this, options);
            case TrollStateKey.SLEEP:
                return new TrollStateSleep(this);
            case TrollStateKey.BATTLE_ATTACK:
                return new TrollStateBattleAttack(this, options);
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    setState(stateKey: TrollStateKey, options?: any): Promise<any> {
        console.log('new troll state:', stateKey);
        this.state.end();
        this.state = this.getState(stateKey, options)
        return this.state.start();
    }

    goToBridge() {
        const target = {x: 0, y: 0}
        const bridgePos = positioner.bridgePosition();
        target.x = bridgePos.x + bridgePos.width / 2
        target.y = bridgePos.y + bridgePos.height / 2

        return this.setState(TrollStateKey.GO_TO, { target, onStart: onTrollCameToBridge, onEnd: onTrollCameToBridge })
    }

    goToLair() {
        const target = {x: 0, y: 0}
        const lairPos = positioner.getLairPosition();
        target.x = lairPos.x + lairPos.width / 2
        target.y = lairPos.y + lairPos.height / 2

        this.setState(TrollStateKey.GO_TO, { target, onStart: onTrollCameToLair, onEnd: onTrollCameToLair })
    }

    goToBed() {
        const target = {x: 0, y: 0}
        const bedPos = positioner.getBedPosition();
        target.x = bedPos.x + 50
        target.y = bedPos.y

        onTrollSleep()
        return this.setState(TrollStateKey.GO_TO, { target, onEnd: () => {
            this.goSleep()
        }})
    }

    goToChar(charId: string) {
        var char = o_.characters.getTraveller(charId)
        if (!char) throw Error('WTF')

        return  this.setState(TrollStateKey.GO_TO, { target: char.container, minDistance: 50 })
    }

    goToDefenderOfChar(charId: string) {
        const target = {x: 0, y: 0}
        var char = o_.characters.getTraveller(charId)
        if (!char) throw Error('WTF')

        const defenderPos = char.getDefenderPosition()
        target.x = defenderPos.x
        target.y = defenderPos.y

        return this.setState(TrollStateKey.GO_TO, { target })
    }

    goToBattlePosition() {
        const target = {x: 0, y: 0}
        const bridgePos = positioner.bridgePosition();
        target.x = bridgePos.x + bridgePos.width / 2
        target.y = bridgePos.y + bridgePos.height / 2

        return this.setState(TrollStateKey.GO_TO, { target })
    }

    goIdle() { this.setState(TrollStateKey.IDLE) }

    goSleep() { this.setState(TrollStateKey.SLEEP) }

    devour(id: string) {
        this.eat(FoodType.MEAT, false, true);
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

        const nextLevelXp = this.getNextLvlReqs()
        const isNewLevel = this.xp === nextLevelXp

        this.stats.updateXp(true, this.xp, nextLevelXp, this.level)

        if (isNewLevel) {
            this.level++
            this.onNewLevel()
        }
    }

    attack(char: Char) {
        return this.setState(TrollStateKey.BATTLE_ATTACK, {targetId: char.id})
    }

    async strike(char: Char) {
        const anim = char.isUnconscious ? CharAnimation.STRIKE_DOWN : CharAnimation.STRIKE
        await this.runAnimationOnce(anim)

        o_.characters.hitChar(char.id, this.rollDmg())
        this.setAnimation(CharAnimation.IDLE)
    }

    async runAnimationOnce(anim: CharAnimation) {
        const p = createPromiseAndHandlers()
        this.setAnimation(anim, p.done)
        return p.promise
    }

    async throwRockAt(char: Char) {
        const rockPlace = o_.bridge.getClosestRockPlace(this)

        await this.setState(TrollStateKey.GO_TO, {target: rockPlace})
        this.directToTarget(char.container)

        const p = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.THROW_STONE, p.done)
        await p.promise

        const rock = new Rock({x: this.x, y: this.sprite.y - this.sprite.height + 10})
        rockPlace.ruin(true)

        this.setAnimation(CharAnimation.IDLE)

        await o_.render.flyTo(rock.sprite, char.getCoordsToThrowInto(), 1000)

        rock.destroy()
        o_.characters.hitChar(char.id, this.rollDmg())
    }

    async throwChar(char: Char) {

        await this.runAnimationOnce(CharAnimation.STRIKE)

        char.setAnimation(CharAnimation.UNCONSCIOUS)

        const p0 = createPromiseAndHandlers()
        const jumpTimeline = o_.render.createJumpingTimeline([this.sprite, char.container], 100, 0)
        jumpTimeline.once('complete', p0.done)
        jumpTimeline.play()
        await p0.promise

        this.setAnimation(CharAnimation.IDLE)

        o_.characters.hitChar(char.id, this.rollDmg(), {grabbed: true, stun: this.rollStun()})

        await o_.render.bounceOfGround(char.container, 50, 1000)
    }

    rollStun() {
        return 2
    }
}