import {eventBus, Evt} from "../../../event-bus";
import {CharKey, EncounterDanger, FoodType, TrollAbility, TrollLocation} from "../../../types";
import {positioner} from "../positioner";
import {CharAnimation} from "../../../entities/char/char-constants";
import {clamp, getClosest, getRndItem, getRndSign, Rect, rnd, rndBetween, Vec} from "../../../utils/utils-math";
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
import {Char} from "../../../entities/char/char";
import {createPromiseAndHandlers, pause} from "../../../utils/utils-async";
import {Rock} from "../../../entities/items/rock";
import {maxTrollLevel, trollConfig} from "../../../configs/troll-config";
import {foodConfig} from "../../../configs/food-config";
import {StatusNotifications} from "../../../interface/status-notifications";
import {O_Container} from "../../core/render/container";
import {TrollStateUnconscious} from "./troll-state-unconscious";
import {HpIndicator} from "../../../interface/hp-indicator";
import {debugExpose} from "../../../utils/utils-misc";
import {battleConfig} from "../../../configs/battle-config";
import {TrollFearLevel} from "./types";
import {TrollStateClimb} from "./troll-state-climb";
import {TrollStateSit} from "./troll-state-sit";
import {SaveData} from "../../save-manager";

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

    fear = 0

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

    timeFearPassed = 0

    constructor(saveData?: SaveData) {
        o_.register.troll(this)

        const pos = positioner.getTrollLairIdlePosition()
        this.container = o_.render.createContainer(pos.x, pos.y)
        this.container.addPhysics();

        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'troll',
            animations: [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.FALL, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.SIT, repeat: -1, frameRate: 4},
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
            parent: this.container,
        })
        this.sprite.setHeight(170, true)

        this.setInitialSpriteOrigin()

        this.setLayer('normal')

        this.statusNotifications = new StatusNotifications(this.container, 0, -this.sprite.height)

        this.zzz = new Zzz(0, 0);

        eventBus.on(Evt.TIME_PASSED, () => this.increaseHunger());

        o_.time.sub(dt => this.update(dt))

        this.state = this.createState(TrollStateKey.IDLE)
        this.state.onStart();

        this.stats = new TrollStats(this)
        this.hp = trollConfig.TROLL_LEVELING[this.level].maxHp
        this.onNewLevel(false);

        this.hpIndicator = new HpIndicator(this, -30, -100, 50, 10)

        eventBus.on(Evt.TIME_PASSED, () => {
            this.timeFearPassed++
            if (this.timeFearPassed > 1) {
                if (this.fear > 0) this.changeFear(trollConfig.FEAR_CHANGES.DAY_PASSED)
                this.timeFearPassed = 0
            }
        });

        eventBus.on(Evt.BATTLE_DEFEAT, () => this.changeFear(trollConfig.FEAR_CHANGES.DEFEAT));

        eventBus.on(Evt.CHAR_DEVOURED, () => this.changeFear(trollConfig.FEAR_CHANGES.DEVOUR));
        eventBus.on(Evt.CHAR_DEVOURED_IN_BATTLE, () => this.changeFear(trollConfig.FEAR_CHANGES.DEVOUR));
        eventBus.on(Evt.CHAR_TORN_APART, () => this.changeFear(trollConfig.FEAR_CHANGES.DEVOUR));

        debugExpose((val: number) => this.addXp(val), 'addXp')
        debugExpose(() => {
            this.level = 5
            this.onNewLevel(false)
        }, 'maxLevel')

        debugExpose((val: number) => this.changeFear(val), 'changeFear')
        debugExpose((val: number) => this.heal(val), 'heal')

        // o_.camera.followTroll(true);
    }


    isAlwaysShowHp = false

    alwaysShowHp(lock: boolean) {
        this.isAlwaysShowHp = lock
        if (lock) {
            this.setHpIndicatorVisible(true)
        }
    }

    setHpIndicatorVisible(val: boolean) {
        if (val) {
            this.hpIndicator.show()
        } else if (!this.isAlwaysShowHp) {
            this.hpIndicator.hide()
        }
    }

    initialize(saveData?: SaveData) {
        this.level = 1
        this.onNewLevel(false)
        this.xp = 0
        this.hp = this.maxHp
        this.hunger = 0
        this.selfControl = this.maxSelfControl
        this.isEnraged = false
        this.fear = 0

        this.timeFearPassed = 0
        this.setState(TrollStateKey.IDLE)
        this.zzz.hide()
        this.hpIndicator.hide()
    }

    reset(saveData?: SaveData) {
        this.initialize(saveData)
    }

    setInitialSpriteOrigin() {
        this.sprite.setOrigin(0.5, 1);
    }

    get positionCenter(): Vec {
        return {
            x: this.x,
            y: this.y - this.sprite.height / 2
        }
    }

    get position(): Vec {
        return {
            x: this.x,
            y: this.y
        }
    }

    get x() {
        return this.container.x
    }

    get y() {
        return this.container.y
    }

    get currentStateKey() {
        return this.state.key
    }

    getCoords() {
        return this.container.getCoords()
    }

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

    getFearLevel() {
        for (let i = 0; i < trollConfig.FEAR_LEVELS.length; i++) {
            const level = trollConfig.FEAR_LEVELS[i]
            if (this.fear >= level[0]) return level[1]
        }
        console.error('cant map fear value ' + this.fear + ' to fear levels')
        return trollConfig.FEAR_LEVELS[trollConfig.FEAR_LEVELS.length - 1][1]
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
        } else {
            this.notificationTimer = null
        }
    }

    changeSelfControl(val: number) {
        if (val === 0) return

        if (val > 0) {
            if (this.selfControl === this.maxSelfControl) return
            this.statusNotifications.showSelfControlIncrease(val)
        } else {
            if (this.selfControl === 0) return
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
        if (!this.isAlwaysShowHp) this.hpIndicator.updateShowAndHide()
    }

    fearLevel: TrollFearLevel = TrollFearLevel.UNPREDICTABLE

    changeFear(val: number) {
        const newFear = clamp(this.fear + val, -trollConfig.TROLL_MAX_FEAR, trollConfig.TROLL_MAX_FEAR)
        if (newFear === this.fear) return

        let newFearLevel = this.fearLevel

        for (let i = 0; i < trollConfig.FEAR_LEVELS.length; i++) {
            const level = trollConfig.FEAR_LEVELS[i]
            const nextLevel = trollConfig.FEAR_LEVELS[i + 1]
            if (
                !nextLevel ||
                (newFear >= level[0] && newFear < nextLevel[0])
            ) {
                newFearLevel = level[1]
                break
            }
        }

        if (newFearLevel !== this.fearLevel) {
            this.fearLevel = newFearLevel
            eventBus.emit(Evt.FEAR_CHANGES, this.fearLevel)
        }

        this.fear = newFear
        this.statusNotifications.showFearChange(val)
        this.stats.update()
    }

    changeTrollHp(val: number, cause = 'hunger') {
        const newVal = this.hp + val;
        this.hp = Math.max(Math.min(newVal, this.maxHp), 0);

        this.hpIndicator.update()

        if (this.hp === 0) {
            this.setState(TrollStateKey.UNCONSCIOUS)

            if (this.hunger === this.maxHunger && !o_.game.isGameover) o_.game.gameOver('Тролль умер! (голод на максимуме, здоровье на нуле)')
        }

        this.stats.update()
    }

    setAnimation(key: CharAnimation, onComplete?: () => void) {
        this.sprite.play(key, {onComplete});
    }

    private createState(stateKey: TrollStateKey, options?: any): TrollState {
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
            case TrollStateKey.CLIMB:
                return new TrollStateClimb(this, options);
            case TrollStateKey.SIT:
                return new TrollStateSit(this, options);
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    setLayer = (layer: 'normal' | 'top') => {
        switch (layer) {
            case "normal":
                o_.layers.remove(this.container, LayerKey.FIELD_OBJECTS_1)
                o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)
                break;
            case "top":
                o_.layers.remove(this.container, LayerKey.FIELD_OBJECTS)
                o_.layers.add(this.container, LayerKey.FIELD_OBJECTS_1)
                break;

        }
    }

    getCanBeUpgradedReached() {
        return maxTrollLevel === this.level
    }

    setState(stateKey: TrollStateKey, options?: any): Promise<any> {
        this.state.end();
        this.state = this.createState(stateKey, options)
        return this.state.start();
    }

    setLocation = (location: TrollLocation) => {
        this.location = location;
        eventBus.emit(Evt.TROLL_LOCATION_CHANGED, location)
    }

    goToBridge = (options: { coord: Vec }) => {
        console.log("goToBridge", options)
        return this.setState(TrollStateKey.GO_TO, {target: options.coord})
    }

    goToLadder = (whichLadder: 'left' | 'right' | 'closest' = 'closest') => {
        const [leftLadderPos, rightLadderPos] = positioner.getLadderBounds()

        let target: Rect
        switch (whichLadder) {
            case "left":
                target = leftLadderPos
                break;
            case "right":
                target = rightLadderPos
                break;
            case "closest":
                target = getClosest(this.getCoords(), leftLadderPos, rightLadderPos)
                break;
        }

        if (this.location === TrollLocation.LAIR) {
            // go to bottom of ladder
            target.y += leftLadderPos.height
        }

        return this.setState(TrollStateKey.GO_TO, {
            target
        })
    }

    climbLadder = (direction: 'up' | 'down', whichLadder: 'left' | 'right' | 'closest' = 'closest') => {
        const [leftLadderPos, rightLadderPos] = positioner.getLadderBounds()

        let target: Rect
        switch (whichLadder) {
            case "left":
                target = leftLadderPos
                break;
            case "right":
                target = rightLadderPos
                break;
            case "closest":
                target = getClosest(this.getCoords(), leftLadderPos, rightLadderPos)
                break;
        }

        if (direction === 'down') {
            target.y += leftLadderPos.height
        }
        return this.setState(TrollStateKey.CLIMB, {target})
    }

    sit = () => {
        return this.setState(TrollStateKey.SIT)
    }

    goToLair = (target: Vec) => {
        target = target || positioner.getTrollLairIdlePosition();

        return this.setState(TrollStateKey.GO_TO, {target})
    }

    goToBed = () => {
        const target = positioner.getBedPosition();

        return this.setState(TrollStateKey.GO_TO, {target});
    }

    goToSit = () => {
        const target = positioner.getChairPosition();

        return this.setState(TrollStateKey.GO_TO, {target});
    }

    goToChar = (charId: string) => {
        var char = o_.characters.getTraveller(charId)
        if (!char) throw Error('WTF')

        if (this.isEnraged) return this.jumpToChar(char)

        return this.setState(TrollStateKey.GO_TO, {target: char.container, minDistance: 50})
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

        return this.isEnraged ? this.jumpTo(target) : this.setState(TrollStateKey.GO_TO, {target})
    }

    getBattlePosition(): Vec {
        const bridgePos = positioner.getBridgePosition();

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
        await this.setState(TrollStateKey.GO_TO, {target: this.getBattlePosition()})

        const fighters = o_.characters.getFighters()
        if (fighters.length) this.directToTarget(fighters[0].container)
    }

    goIdle() {
        this.setState(TrollStateKey.IDLE)
    }

    goSleep() {
        this.setState(TrollStateKey.SLEEP)
    }

    goTo(target: Vec, minDistance?: number) {
        return this.setState(TrollStateKey.GO_TO, {target, minDistance})
    }

    async devour(id: string) {
        await this.runAnimationOnce(CharAnimation.STRIKE_DOWN)

        this.eat(FoodType.MEAT, false, true)
        o_.characters.charEaten(id)

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

    burstBlood() {
        o_.render.burstBlood(
            this.container.x,
            this.container.y - this.sprite.height / 2
        )
    }

    getLastHit() {
        this.burstBlood()
        this.burstBlood()
        this.burstBlood()

        o_.audio.playSound(SOUND_KEY.TROLL_DEATH);

        o_.game.gameOver('Тролль убит!')
    }

    moveTowards(x: number, y: number, directToTarget = true) {
        o_.render.moveTowards(
            this.container,
            x,
            y,
            this.speed,
        )

        if (directToTarget) {
            this.directToTarget({x, y})
        }
    }

    directToTarget(target: Vec) {
        o_.render.directToTarget(this.sprite, target, this.container.x);
    }

    rageStopCheck() {
        if (getRndSign() < 0) this.setEnraged(false)
    }

    rageStartCheck() {
        let chanceOfRage = (this.maxSelfControl - this.selfControl) / (100 * 2)
        const roll = rnd()
        console.log('chance of rage', chanceOfRage, 'roll', roll, roll <= chanceOfRage)
        if (roll <= chanceOfRage) this.setEnraged(true)
    }

    rollDmg(grapple = false, rockThrow = false) {
        let dmg = rndBetween(this.dmg[0], this.dmg[1])

        if (this.isEnraged) dmg *= trollConfig.DMG_MODIFIER_RAGE
        if (grapple) dmg *= trollConfig.DMG_MODIFIER_GRAPPLE
        if (rockThrow) dmg *= trollConfig.DMG_MODIFIER_THROW_ROCK

        return Math.ceil(dmg)
    }

    getDmg(grapple = false, rockThrow = false): [number, number] {
        const dmg = [this.dmg[0], this.dmg[1]] as [number, number]

        if (grapple) {
            dmg[0] = Math.ceil(dmg[0] * trollConfig.DMG_MODIFIER_GRAPPLE)
            dmg[1] = Math.ceil(dmg[1] * trollConfig.DMG_MODIFIER_GRAPPLE)
        }

        if (rockThrow) {
            dmg[0] = Math.ceil(dmg[0] * trollConfig.DMG_MODIFIER_THROW_ROCK)
            dmg[1] = Math.ceil(dmg[1] * trollConfig.DMG_MODIFIER_THROW_ROCK)
        }

        return dmg
    }

    rollStun() {
        return 2
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
        rockPlace.ruin(true)

        const p = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.THROW_STONE, p.done)
        await p.promise

        const rock = new Rock({x: this.x, y: this.container.y - this.container.height + 10})

        this.setAnimation(CharAnimation.IDLE)

        await o_.render.flyTo(rock.sprite, char.getCoordsToThrowInto(), 1000)

        rock.destroy()
        o_.characters.hitChar(char.id, this.rollDmg(false, true))
    }

    async throwChar(char: Char) {

        await this.runAnimationOnce(CharAnimation.GRAPPLE)

        char.setAnimation(CharAnimation.UNCONSCIOUS)

        const p0 = createPromiseAndHandlers()
        const jumpTimeline = o_.render.createJumpingTween([this.container, char.container], 100, 0)
        jumpTimeline.once('complete', p0.done)
        jumpTimeline.play()
        await p0.promise

        this.setAnimation(CharAnimation.IDLE)

        o_.characters.hitChar(char.id, this.rollDmg(true), {grabbed: true, stun: this.rollStun()})

        await o_.render.bounceOfGround(char.container, 50, 1000)

        this.grappleCooldown = battleConfig.GRAPPLE_COOLDOWN
    }

    updateCooldowns() {
        if (this.grappleCooldown > 0) this.grappleCooldown--
    }

    resetCooldownds() {
        this.grappleCooldown = 0
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