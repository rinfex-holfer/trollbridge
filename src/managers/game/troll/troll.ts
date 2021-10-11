import {eventBus, Evt} from "../../../event-bus";
import {CharKey, FoodType, TrollAbility, TrollLocation} from "../../../types";
import {positioner} from "../positioner";
import {CharAnimation} from "../../../entities/char/char-constants";
import {clamp, getRndItem, getRndSign, rnd, rndBetween, Vec} from "../../../utils/utils-math";
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
import {Char} from "../../../entities/char/char";
import {createPromiseAndHandlers, pause} from "../../../utils/utils-async";
import {Rock} from "../../../entities/rock";
import {trollConfig} from "../../../configs/troll-config";
import {foodConfig} from "../../../configs/food-config";
import {StatusNotifications} from "../../../interface/status-notifications";
import {O_Container} from "../../core/render/container";
import {TrollStateUnconscious} from "./troll-state-unconscious";
import {HpIndicator} from "../../../interface/hp-indicator";
import {debugExpose} from "../../../utils/utils-misc";
import {gameConstants} from "../../../configs/constants";
import {battleConfig} from "../../../configs/battle-config";

let troll: Troll

export class Troll {

    location: TrollLocation = TrollLocation.LAIR

    isEnraged: boolean = false

    xp = 0

    level = 1

    hp = 1
    maxHp = 1

    hunger = 0
    maxHunger = trollConfig.TROLL_MAX_HUNGER
    selfControl = trollConfig.TROLL_MAX_SELF_CONTROL
    maxSelfControl = trollConfig.TROLL_MAX_SELF_CONTROL

    block = 0
    dmg = [1, 1]

    sprite: O_AnimatedSprite
    container: O_Container
    statusNotifications: StatusNotifications
    hpIndicator: HpIndicator

    zzz: Zzz

    speed = trollConfig.TROLL_SPEED

    state: TrollState

    stats: TrollStats

    notificationTimer: null | number = null

    grappleCooldown = 0

    constructor() {
        o_.register.troll(this)

        troll = this;
        const lairPos = positioner.getLairPosition();

        this.container = o_.render.createContainer(lairPos.x + lairPos.width / 2, lairPos.y + lairPos.height / 2)
        this.container.addPhysics();

        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'troll',
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.FALL, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DAMAGED, frameRate: 8},
                {framesPrefix: CharAnimation.DEVOUR, frameRate: 8},
                {framesPrefix: CharAnimation.GRAPPLE, frameRate: 8},
                {framesPrefix: CharAnimation.STRIKE, frameRate: 8},
                {framesPrefix: CharAnimation.STRIKE_DOWN, frameRate: 4},
                {framesPrefix: CharAnimation.THROW_STONE, frameRate: 8},
                {framesPrefix: CharAnimation.UNCONSCIOUS, frameRate: 1},
            ],
            x: 0,
            y: 0,
            parent: this.container
        })
        this.setInitialSpriteOrigin()

        // o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)

        this.statusNotifications = new StatusNotifications(this.container, 0, -this.sprite.height)

        this.zzz = new Zzz(0, 0);

        eventBus.on(Evt.TIME_PASSED, () => this.increaseHunger());

        o_.time.sub(dt => this.update(dt))

        this.state = this.getState(TrollStateKey.IDLE)
        this.state.onStart();

        this.stats = new TrollStats(this)
        this.hp = trollConfig.TROLL_LEVELING[this.level].maxHp
        this.onNewLevel(false);

        this.hpIndicator = new HpIndicator(this, -30, -100, 50, 10)
        eventBus.on(Evt.BATTLE_STARTED, () => this.hpIndicator.show());
        eventBus.on(Evt.BATTLE_END, () => this.hpIndicator.hide());

        onTrollCameToLair()

        debugExpose((val: number) => this.addXp(val), 'addXp')
        debugExpose(() => {
            this.level = 5
            this.onNewLevel(false)
        }, 'maxLevel')
    }

    setInitialSpriteOrigin() {
        this.sprite.setOrigin(0.5, 1);
    }

    get x() { return this.container.x }
    get y() { return this.container.y }

    onNewLevel(animated = true) {
        const levelConfig = trollConfig.TROLL_LEVELING[this.level]
        this.xp = 0
        this.maxHp = levelConfig.maxHp
        this.block = levelConfig.block
        this.dmg = levelConfig.dmg

        this.stats.update(animated)

        if (animated && levelConfig.newAbilities.length) {
            setTimeout(() => {
                this.stats.showNewAbility(levelConfig.newAbilities[0])
            }, 2000)
        }
    }

    getNextLvlReqs() {
        return trollConfig.TROLL_LEVELING[this.level].xp
    }

    getIsAlive() {
        return this.hp > 0;
    }

    increaseHunger(val: number = trollConfig.HUNGER_PER_TIME) {
        if (this.hunger === trollConfig.TROLL_MAX_HUNGER) {
            const dmg = -Math.ceil(this.maxHp * trollConfig.HP_MINUS_WHEN_HUNGRY)
            this.statusNotifications.showHungerDmg(dmg)
            this.changeTrollHp(dmg, 'hunger')
            this.hpIndicator.updateShowAndHide()
        }

        this.changeHunger(val)
    }

    eat(food: FoodType, isStale: boolean = false, isHuman: boolean = false) {
        let foodKey = isHuman ? 'HUMAN' : 'ANIMAL';
        if (isStale) foodKey += '_STALE'

        // @ts-ignore
        const hpChange = foodConfig.FOOD[food][foodKey].hp
        // @ts-ignore
        const hungerChange = foodConfig.FOOD[food][foodKey].hunger
        // @ts-ignore
        const selfControlChange = foodConfig.FOOD[food][foodKey].selfControl

        console.log(food, isHuman, )

        this.heal(hpChange)
        this.changeHunger(hungerChange)
        this.changeSelfControl(selfControlChange)

        // o_.audio.playSound(SOUND_KEY.CHEW)
        o_.audio.playSound(getRndItem([SOUND_KEY.EATING_0, SOUND_KEY.EATING_1, SOUND_KEY.EATING_2, SOUND_KEY.EATING_3]))
        eventBus.emit(Evt.TROLL_STATS_CHANGED)
    }

    changeHunger(val: number) {
        this.hunger = clamp(this.hunger + val, 0, this.maxHunger)
        this.stats.update()
    }

    getXpForSquad(chars: CharKey[]) {
        let sum = 0
        chars.forEach(c => sum += trollConfig.TROLL_LEVELING[this.level].xpRewards[c])
        return sum
    }

    getCurrentAbilities(): TrollAbility[] {
        let abilities: TrollAbility[] = []
        for (let i = this.level; i > 0; i--) abilities = abilities.concat(trollConfig.TROLL_LEVELING[i].newAbilities)
        return abilities
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
        if (val === 0) return

        if (val > 0) {
            this.statusNotifications.showSelfControlIncrease(val)
        } else {
            this.statusNotifications.showSelfControlReduce(val)
        }

        this.selfControl = clamp(this.selfControl + val, 0, this.maxSelfControl)
        this.stats.update()
    }

    heal(val: number) {
        if (this.hp === this.maxHp) return
        val = Math.ceil(val)
        this.statusNotifications.showHeal(val)
        this.changeTrollHp(val)
        this.hpIndicator.updateShowAndHide()
    }

    changeTrollHp(val: number, cause = 'hunger') {
        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, this.maxHp), 0);

        this.hpIndicator.update()

        if (this.hp === 0) {
            o_.game.gameOver(cause)
            o_.audio.playSound(SOUND_KEY.TROLL_DEATH)
            this.setState(TrollStateKey.UNCONSCIOUS)
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
            case TrollStateKey.UNCONSCIOUS:
                return new TrollStateUnconscious(this);
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
        target.x = bedPos.x
        target.y = bedPos.y

        onTrollSleep()
        return this.setState(TrollStateKey.GO_TO, { target} ).then(() => this.goSleep())
    }

    goToChar(charId: string) {
        var char = o_.characters.getTraveller(charId)
        if (!char) throw Error('WTF')

        if (this.isEnraged) return this.jumpToChar(char)

        return  this.setState(TrollStateKey.GO_TO, { target: char.container, minDistance: 50 })
    }

    async jumpToChar(char: Char) {
        await this.jumpTo({x: char.container.x - 50, y: char.container.y})
    }

    async jumpTo(pos: Vec) {
        await o_.render.jumpTo(this.container, pos)
    }

    moveToChar(char: Char) {
        if (this.isEnraged) return this.jumpToChar(char)
        else return this.goToChar(char.id)
    }

    moveToDefenderOfChar(char: Char) {
        const target = {x: 0, y: 0}

        const defenderPos = char.getDefenderPosition()
        target.x = defenderPos.x
        target.y = defenderPos.y

        return this.isEnraged ? this.jumpTo(target) : this.setState(TrollStateKey.GO_TO, { target })
    }

    getBattlePosition(): Vec {
        const bridgePos = positioner.bridgePosition();

        return {
            x: bridgePos.x + bridgePos.width / 2,
            y: bridgePos.y + bridgePos.height / 2
        }
    }

    async jumpToBattlePosition() {
        await this.jumpTo(this.getBattlePosition())
    }

    async goToBattlePosition() {
        if (this.isEnraged) await this.jumpToBattlePosition()
        await this.setState(TrollStateKey.GO_TO, { target: this.getBattlePosition() })

        const fighters = o_.characters.getFighters()
        if (fighters.length) this.directToTarget(fighters[0].container)
    }

    goIdle() { this.setState(TrollStateKey.IDLE) }

    goSleep() { this.setState(TrollStateKey.SLEEP) }

    goTo(target: Vec, minDistance?: number) {
        return this.setState(TrollStateKey.GO_TO, { target, minDistance })
    }

    async devour(id: string) {
        await this.runAnimationOnce(CharAnimation.STRIKE_DOWN)

        this.eat(FoodType.MEAT, false, true);
        o_.characters.charEaten(id);

        await pause(1000)

        this.setAnimation(CharAnimation.IDLE)
    }

    async devourAttack(id: string) {
        const char = o_.characters.getTraveller(id)

        await this.goTo(char.container, 30)
        await this.runAnimationOnce(CharAnimation.GRAPPLE)

        const dist = 100
        await Promise.all([
            o_.render.flyTo(this.container, {x: this.container.x - dist, y: this.container.y}, 500),
            o_.render.flyTo(char.container, {x: char.container.x - dist, y: char.container.y}, 500)
        ])

        await this.devour(id)
    }

    getHit(dmg: number) {
        dmg = Math.ceil(dmg)
        const isBlocked = rnd() < this.block
        if (!isBlocked) {
            o_.render.burstBlood(
                this.container.x,
                this.container.y - this.sprite.height / 2
            )

            o_.audio.playSound(SOUND_KEY.HIT);
            pause(100).then(() => {
                o_.audio.playSound(getRndItem([SOUND_KEY.TROLL_WOUNDED_0, SOUND_KEY.TROLL_WOUNDED_1, SOUND_KEY.TROLL_WOUNDED_2]));
            })
            this.changeTrollHp(-dmg, 'battle');
            this.statusNotifications.showDmg(dmg, 'left')
        } else {
            o_.audio.playSound(getRndItem([SOUND_KEY.TROLL_BLOCK_0, SOUND_KEY.TROLL_BLOCK_1, SOUND_KEY.TROLL_BLOCK_2]));
            this.statusNotifications.showBlock()
        }
    }

    moveTowards(x: number, y: number) {
        o_.render.moveTowards(
            this.container,
            x,
            y,
            this.speed,
        )
        this.directToTarget({x, y})
    }

    directToTarget(target: Vec) {
        o_.render.directToTarget(this.sprite, target, this.container.x);
    }

    rageStopCheck() {
        if (getRndSign() < 0) this.setEnraged(false)
    }

    rageStartCheck() {
        let chanceOfRage = (this.maxSelfControl - this.selfControl) / (100 * 2)
        chanceOfRage = Math.max(chanceOfRage, 0.01)
        const roll = rnd()
        console.log('chance of rage', chanceOfRage, 'roll', roll, rnd() <= chanceOfRage)
        if (rnd() <= chanceOfRage) this.setEnraged(true)
    }

    rollDmg(modifier = 1) {
        let dmg = rndBetween( this.dmg[0], this.dmg[1])
        if (this.isEnraged) dmg *= 1.2
        return Math.ceil(dmg * modifier)
    }

    rollStun() {
        return rndBetween(1, 3)
    }

    stop() {
        this.container.stop()
    }

    update(dt: number) {
        this.state.update(dt)
    }

    addXpForCurrentFighters(factor = 1) {
        const fighters = o_.characters.getFighters();
        const xp = this.getXpForSquad(fighters.map(f => f.key))
        this.addXp(Math.ceil(factor * xp))
    }

    addXp(val: number) {
        if (val === 0) return

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
        o_.audio.playSound(SOUND_KEY.TROLL_ATTACK_VOICE)

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

        if (this.isEnraged) await this.jumpTo(rockPlace)
        await this.setState(TrollStateKey.GO_TO, {target: rockPlace})
        this.directToTarget(char.container)

        o_.audio.playSound(SOUND_KEY.TROLL_ATTACK_VOICE)

        const p = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.THROW_STONE, p.done)
        await p.promise

        const rock = new Rock({x: this.x, y: this.container.y - this.container.height + 10})
        rockPlace.ruin(true)

        this.setAnimation(CharAnimation.IDLE)

        await o_.render.flyTo(rock.sprite, char.getCoordsToThrowInto(), 1000)

        rock.destroy()
        o_.characters.hitChar(char.id, this.rollDmg())
    }

    async throwChar(char: Char) {

        await this.runAnimationOnce(CharAnimation.GRAPPLE)

        char.setAnimation(CharAnimation.UNCONSCIOUS)

        const p0 = createPromiseAndHandlers()
        const jumpTimeline = o_.render.createJumpingTimeline([this.container, char.container], 100, 0)
        jumpTimeline.once('complete', p0.done)
        jumpTimeline.play()
        await p0.promise

        this.setAnimation(CharAnimation.IDLE)

        o_.characters.hitChar(char.id, this.rollDmg(battleConfig.GRAPPLE_DMG_MODIFIER), {grabbed: true, stun: this.rollStun()})

        await o_.render.bounceOfGround(char.container, 50, 1000)

        this.grappleCooldown = battleConfig.GRAPPLE_COOLDOWN
    }

    updateCooldowns() {
        if (this.grappleCooldown > 0) this.grappleCooldown--
    }

    setEnraged(val: boolean) {
        if (val === this.isEnraged) return

        this.isEnraged = val

        if (val) {
            o_.audio.playSound(SOUND_KEY.TROLL_BREATHING)
            this.statusNotifications.showRage()
        } else {
            this.statusNotifications.showRageStops()
        }
    }

    laugh() {
        o_.audio.playSound(getRndItem([SOUND_KEY.TROLL_LAUGH_0, SOUND_KEY.TROLL_LAUGH_MEDIUM]))
    }

    laughHard() {
        o_.audio.playSound(getRndItem([SOUND_KEY.TROLL_LAUGH_HARD, SOUND_KEY.TROLL_LAUGH_MEDIUM]))
    }

    hmm() {
        o_.audio.playSound(getRndItem([SOUND_KEY.TROLL_HM, SOUND_KEY.TROLL_HEY, SOUND_KEY.TROLL_OH]))
    }
}