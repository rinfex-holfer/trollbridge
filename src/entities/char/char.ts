import {CharKey, ResourceKey, SquadPlace} from "../../types";
import {charConfig} from "../../configs/char-config";
import {createId, stub} from "../../utils/utils-misc";
import {CharState} from "./states/CharState";
import {CharStateIdle} from "./states/CharStateIdle";
import {CharStateGoAcross} from "./states/CharStateGoAcross";
import {CharAnimation, CharStateKey} from "./char-constants";
import {CharStateSurrender} from "./states/CharStateSurrender";
import {CharStateDead} from "./states/CharStateDead";
import {CharStateBones} from "./states/CharStateBones";
import {CharSpeakText} from "../../interface/char-speak-text";
import {eventBus, Evt} from "../../event-bus";
import {CharStateGoToTalk} from "./states/CharStateGoToTalk";
import {gameConstants} from "../../configs/constants";
import {SOUND_KEY} from "../../managers/core/audio";
import {CharStateBattleIdle} from "./states/CharStateBattleIdle";
import {clamp, rnd, rndBetween, Vec} from "../../utils/utils-math";
import {createPromiseAndHandlers, pause} from "../../utils/utils-async";
import {CharStateBattleAttack} from "./states/CharStateBattleAttack";
import {flyingStatusChange} from "../../interface/basic/flying-status-change";
import {HpIndicator} from "../../interface/hp-indicator";
import {CharMpIndicator} from "../../interface/char-mp-indicator";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {O_Sprite} from "../../managers/core/render/sprite";
import {O_Container} from "../../managers/core/render/container";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Gold} from "../gold";
import {Meat, MeatLocation, meatSprite} from "../meat";
import {CharStateBattleGoDefend} from "./states/CharStateBattleGoDefend";
import {CharStateGoToBattlePosition} from "./states/CharStateGoToBattlePosition";
import {CharStateGoTo} from "./states/CharStateGoTo";
import {Horse} from "../horse";
import {CharStateUnconscious} from "./states/CharStateUnconscious";
import {DmgOptions} from "../../utils/utils-types";
import {goldConfig} from "../../configs/gold-config";
import {foodConfig} from "../../configs/food-config";
import {Squad} from "../../managers/game/squad";
import {StatusNotifications} from "../../interface/status-notifications";
import {positioner} from "../../managers/game/positioner";
import {trollConfig} from "../../configs/troll-config";

export enum CharBehavior {
    COMMON = 'COMMON',
    VIGILANTE = 'VIGILANTE',
    KING = 'KING',
}

export class Char {
    key: CharKey
    id: string
    hp: number
    maxHp: number
    morale: number
    maxMorale: number
    moralePrice: [number, number]
    name: string
    dmg = [1, 1]

    speed = gameConstants.CHAR_SPEED

    food: number
    gold: number

    isRobbed = false
    isReleased = false

    isUnconscious = false
    isAlive = true
    isPrisoner = false
    isFleeing = false
    isSurrender = false
    isBones = false
    isMetTroll = false

    isCombatant: boolean
    counterAttack: number = 0
    evasion: number = 0
    block?: number
    isDefender: boolean
    isRanged: boolean
    isMounted: boolean
    isDeMounted: boolean = false

    state: CharState
    timeWithoutFood = 0

    // actionsMenu: CharActionsMenu
    speakText: CharSpeakText
    hpIndicator: HpIndicator
    mpIndicator: CharMpIndicator

    sprite: O_AnimatedSprite
    bones: O_Sprite
    container: O_Container

    unsub: (() => void)[] = []

    squad: Squad | null = null
    squadPlace: SquadPlace | null = null

    statusNotifications: StatusNotifications

    behavior: CharBehavior

    constructor(key: CharKey, x: number, y: number, behavior = CharBehavior.COMMON) {
        const charTemplate = charConfig[key]

        this.id = createId(key)
        this.key = key
        this.behavior = behavior

        this.hp = charTemplate.hp
        this.maxHp = charTemplate.hp
        this.morale = charTemplate.morale
        this.maxMorale = charTemplate.morale
        this.moralePrice = charTemplate.moralePrice

        this.name = charTemplate.name
        this.isCombatant = charTemplate.isCombatant
        this.dmg = charTemplate.dmg;

        if (charTemplate.counterAttack) this.counterAttack = charTemplate.counterAttack
        if (charTemplate.evade) this.evasion = charTemplate.evade
        this.block = charTemplate.block

        this.isDefender = !!charTemplate.isDefender
        this.isRanged = !!charTemplate.isRanged
        this.isMounted = !!charTemplate.isMounted

        this.gold = rndBetween(charTemplate.resources.gold[0], charTemplate.resources.gold[1])
        this.food = rndBetween(charTemplate.resources.food[0], charTemplate.resources.food[1])

        this.container = o_.render.createContainer(x, y)
        this.container.addPhysics()

        this.sprite = this.createSprite(0, 0)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)

        this.bones = this.createBones()
        this.bones.setVisibility(false);

        // this.actionsMenu = new CharActionsMenu(this);
        this.speakText = new CharSpeakText(this.container);
        this.hpIndicator = new HpIndicator(this);
        this.mpIndicator = new CharMpIndicator(this);

        this.statusNotifications = new StatusNotifications(this.container, 0, -130)

        this.state = this.behavior === CharBehavior.VIGILANTE
            ? this.getState(CharStateKey.IDLE)
            : this.getState(CharStateKey.GO_ACROSS)
        this.state.start();

        const subId = eventBus.on(Evt.ENCOUNTER_ENDED, () => {
            this.setIndicatorsVisible(false)
        })
        this.unsub.push(() => eventBus.unsubscribe(Evt.ENCOUNTER_ENDED, subId))

        const subId2 = eventBus.on(Evt.CHAR_DEFEATED, (key) => this.onCharDefeated(key))
        this.unsub.push(() => eventBus.unsubscribe(Evt.CHAR_DEFEATED, subId2))

        const subId3 = eventBus.on(Evt.CHAR_DEVOURED_IN_BATTLE, (key) => this.onCharDevoured(key))
        this.unsub.push(() => eventBus.unsubscribe(Evt.CHAR_DEVOURED_IN_BATTLE, subId3))

        // @ts-ignore
        // window.changeMp = (a) => this.changeMp(a)
    }

    getIsNewTraveller() { return !this.isMetTroll }
    getIsTraveller() { return this.isAlive && !this.isPrisoner }
    getIsAbleToFight() { return this.getIsTraveller() && !this.isSurrender && !this.isUnconscious }
    getIsPrisoner() { return this.isAlive && this.isPrisoner }

    onCharDefeated(key: CharKey) {
        if (this.getIsAbleToFight()) {
            this.changeMp(-rndBetween(charConfig[key].moralePrice[0], charConfig[key].moralePrice[1]))
        }
    }

    onCharDevoured(key: CharKey) {
        if (this.getIsAbleToFight()) {
            this.changeMp(-rndBetween(charConfig[key].moralePrice[0], charConfig[key].moralePrice[1]))
        }
    }

    destroy() {
        // this.actionsMenu.destroy();
        this.unsub.forEach(f => f());
        this.state.end();
        this.speakText.destroy();
        this.container.destroy();

        if (this.squad) this.squad.removeChar(this)
    }

    update(dt: number) {
        this.state.update(dt);
    }

    getState(stateKey: CharStateKey, options?: any): CharState {
        switch (stateKey) {
            case CharStateKey.IDLE:
                return new CharStateIdle(this);
            case CharStateKey.GO_ACROSS:
                return new CharStateGoAcross(this);
            case CharStateKey.SURRENDER:
                return new CharStateSurrender(this, options);
            case CharStateKey.DEAD:
                return new CharStateDead(this);
            case CharStateKey.BONES:
                return new CharStateBones(this);
            // case CharStateKey.PRISONER:
            //     return new CharStatePrisoner(this);
            case CharStateKey.GO_TO_TALK:
                return new CharStateGoToTalk(this);
            case CharStateKey.BATTLE_IDLE:
                return new CharStateBattleIdle(this);
            case CharStateKey.BATTLE_ATTACK:
                return new CharStateBattleAttack(this);
            case CharStateKey.BATTLE_GO_DEFEND:
                return new CharStateBattleGoDefend(this, options)
            case CharStateKey.GO_TO:
                return new CharStateGoTo(this, options)
            case CharStateKey.GO_TO_BATTLE_POSITION:
                return new CharStateGoToBattlePosition(this)
            case CharStateKey.UNCONSCIOUS:
                return new CharStateUnconscious(this, options)
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    setState(stateKey: CharStateKey, options?: any) {
        this.state.end();
        console.log(this.key, this.state.key, 'to', stateKey)
        this.state = this.getState(stateKey, options)
        return this.state.start();
    }

    createSprite(x: number, y: number, atlasKey = charConfig[this.key].atlasKey) {
        const sprite = o_.render.createAnimatedSprite({
            // @ts-ignore
            atlasKey,
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.FALL, frameRate: 3},
                {framesPrefix: CharAnimation.STRIKE, frameRate: 8},
                {framesPrefix: CharAnimation.DAMAGED, frameRate: 8},
                {framesPrefix: CharAnimation.BLOCK, frameRate: 8},
                {framesPrefix: CharAnimation.PRISONER, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.SURRENDER, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.UNCONSCIOUS, frameRate: 1},
            ],
            x,
            y,
            parent: this.container
        })
        sprite.setOrigin(0.5, 1);

        this.sprite = sprite

        return sprite;
    }

    disableInteractivity() {
        this.container.setInteractive(false)
        this.sprite.setInteractive(false)
        // this.actionsMenu.hide()
    }

    enableInteractivity() {
        if (this.isBones) return;
        this.container.setInteractive(true)
        this.sprite.setInteractive(true)
        // this.actionsMenu.checkIsHovered()
        // this.actionsMenu.show()
    }

    onSpriteClicked(cb: (char: Char) => void) {
        this.sprite.onClick(() => cb(this))
    }

    setCursor(cursor: string) {
        // this.sprite.setInteractive(false)
        // this.sprite.setInteractive(true, {cursor})
        if (!this.sprite.obj.input) this.sprite.setInteractive(true, {cursor})
        else this.sprite.obj.input.cursor = cursor
    }

    onSpritePointerOver(cb: (char: Char) => void) {
        this.sprite.onPointerOver(() => cb(this))
    }

    onSpritePointerOut(cb: (char: Char) => void) {
        this.sprite.onPointerOut(() => cb(this))
    }

    createBones() {
        const bones = o_.render.createSprite('bones', 0, 0, {parent: this.container});
        bones.setOrigin(0.5, 0.5);
        return bones;
    }

    getCoords(): Vec {
        return this.container.getCoords();
    }

    changeResources(key: ResourceKey, val: number) {
        switch (key) {
            case ResourceKey.GOLD:
                this.gold = Math.max(this.gold + val, 0)
                break;
            case ResourceKey.FOOD:
                this.food = Math.max(this.food + val, 0)
                break;
        }

        // this.actionsMenu.updateButtons()
    }

    moveTowards(x: number, y: number) {
        o_.render.moveTowards(
            this.container,
            x,
            y,
            this.speed,
        )
    }

    stop() {
        this.container.stop()
    }

    pay() {
        const amountGold = Math.ceil(this.gold * 0.33);
        const amountFood = Math.ceil(this.food * 0.33);
        this.dropGold(amountGold, true)
        pause(300).then(() => this.dropFood(amountFood, true))
    }

    eat() {
        this.timeWithoutFood = 0;
    }

    public dropAll() {
        this.dropGold(this.gold)
        this.dropFood(this.food)
    }

    public giveAll() {
        this.dropGold(this.gold, true)
        this.dropFood(this.food, true)
    }

    giveGoldPayment() {
        return this.giveGold(Math.ceil(trollConfig.PASS_COST * this.gold))
    }

    giveGold(amount: number) {
        this.changeResources(ResourceKey.GOLD, -amount);

        const gold: Gold[] = []
        while (amount) {
            const goldInSprite = Math.min(amount, goldConfig.MAX_GOLD_IN_SPRITE)
            amount -= goldInSprite
            gold.push(new Gold(this.getCoords(), goldInSprite))
        }

        return gold
    }

    dropGold(amount: number, flyToStorage?: boolean) {
        const gold = this.giveGold(amount)

        if (flyToStorage) {
            o_.lair.treasury.gatherGold(gold)
        } else {
            gold.forEach(g => {
                let coord = this.getCoords();
                coord.x += rndBetween(-40, 40)
                coord.y += rndBetween(-40, 40)
                g.throwTo(coord)
            })
        }
    }

    payFood() {
        this.dropFood(Math.ceil(this.food * trollConfig.PASS_COST), true)
    }
    dropFood(amount: number, flyToStorage?: boolean) {
        this.changeResources(ResourceKey.FOOD, -amount);

        while (amount) {
            amount--
            const coord = this.getCoords()
            coord.x += rndBetween(-80, 80)
            coord.y += (-this.sprite.height / 2) + rndBetween(-80, 80)

            const meat = new Meat(this.getCoords(), MeatLocation.GROUND)
            if (flyToStorage) {
                meat.bePlacedOrBeEaten()
            } else {
                meat.throwTo(coord)
            }
        }
    }

    dropSelfMeat(howMuch: number) {
        for (let i = 0; i < howMuch; i++) {
            const coord = this.getCoords()
            coord.x += rndBetween(-80, 80)
            coord.y += (-this.sprite.height / 2) + rndBetween(-80, 80)

            const meat = new Meat(this.getCoords(), MeatLocation.GROUND, true, i < 2 ? meatSprite.HUMAN_LEG : meatSprite.HUMAN_HAND)
            meat.throwTo(coord)
        }
    }

    takeGold(gold: Gold) {
        return gold.flyTo({x: this.container.x, y: this.container.y - 70}).then(() => {
            o_.audio.playSound(SOUND_KEY.PICK)
            this.gold += gold.props.amount
            gold.destroy()
        })
    }

    takeMeat(meat: Meat) {
        return meat.flyTo({x: this.container.x, y: this.container.y - 70}).then(() => {
            o_.audio.playSound(SOUND_KEY.BONK)
            this.food += 1
            meat.destroy()
        })
    }

    setIndicatorsVisible(val: boolean) {
        if (val) {
            this.hpIndicator.show();
            this.mpIndicator.show();
        } else {
            this.hpIndicator.hide();
            this.mpIndicator.hide();
        }
    }

    surrender(showNotification?: boolean) {
        this.setIndicatorsVisible(false)
        return this.setState(CharStateKey.SURRENDER, {goBack: !this.isUnconscious, showNotification});
    }

    becomeDevoured() {
        if (o_.battle.isBattle) {
            eventBus.emit(Evt.CHAR_DEVOURED_IN_BATTLE, this.key)
        } else {
            eventBus.emit(Evt.CHAR_DEVOURED, this.key)
        }
        o_.audio.playSound(SOUND_KEY.TORN);
        o_.render.burstBlood(this.container.x, this.container.y);
        o_.render.burstBlood(this.container.x, this.container.y - 10);
        o_.render.burstBlood(this.container.x, this.container.y - 20);
        this.dropAll()
        this.dropSelfMeat(foodConfig.FOOD_FROM_DEVOURED_CHARACTER)
        this.toBones()
    }

    toBones() {
        this.setState(CharStateKey.BONES);
    }

    setAnimation(key: CharAnimation, loop?: boolean, onComplete?: () => void) {
        this.sprite.play(key, onComplete && {onComplete});
    }

    goToTalk() {
        this.setState(CharStateKey.GO_TO_TALK);
        return this.movePromise
    }

    readyToTalk() {
        this.isMetTroll = true;
        this.setState(CharStateKey.IDLE);
        eventBus.emit(Evt.CHAR_READY_TO_TALK, this.id);
    }

    makeImprisoned() {
        // this.setState(CharStateKey.PRISONER);
    }

    getKilled() {
        return this.setState(CharStateKey.DEAD);
    }

    goAcrossBridge() {
        if (this.state.key !== CharStateKey.GO_ACROSS) return this.setState(CharStateKey.GO_ACROSS);
    }

    release() {
        this.isReleased = true
        this.goAcrossBridge()
    }

    startFighting() {
        if (!this.isCombatant) {
            this.setState(CharStateKey.SURRENDER);
        } else {
            this.setState(CharStateKey.BATTLE_IDLE);
        }
    }

    speak(text: string) {
        this.speakText.showText(text, 5000);
    }

    clearText() {
        this.speakText.hideText();
    }

    rollDmg(): number {
        return rndBetween(this.dmg[0], this.dmg[1]);
    }

    rollCounterAttack(modifier: number = 0) {
        return rnd() < (this.counterAttack + modifier)
    }

    rollEvade(modifier: number = 0) {
        return rnd() < (this.evasion + modifier)
    }

    rollBlock() {
        if (!this.block) return false
        const roll = rnd()
        console.log('roll', roll)
        return roll < this.block
    }

    changeMp(val: number) {
        this.morale = clamp(this.morale+val, 0, this.maxMorale);
        this.mpIndicator.update();

        if (val < 0) {
            this.statusNotifications.showMoraleDmg(-val, 'right')
        }

        if (!this.isSurrender && this.morale <= 0) {
            this.surrender(true);
        }
    }

    changeHp(val: number) {
        this.hp = clamp(this.hp+val, 0, this.maxHp);
        this.hpIndicator.update();
    }

    tryToBlock(dmg: number, options?: DmgOptions) {
        if (!options?.grabbed && this.getIsAbleToFight() && this.rollBlock()) {
            this.runAnimationOnce(CharAnimation.BLOCK).then(() => this.setAnimation(CharAnimation.IDLE))
            o_.audio.playSound(SOUND_KEY.BLOCK);
            this.statusNotifications.showBlock()
            return true
        }

        return false
    }

    async getHit(dmg: number, options?: DmgOptions) {
        const blocked = this.tryToBlock(dmg, options)
        if (blocked) return

        o_.audio.playSound(SOUND_KEY.HIT);
        o_.render.burstBlood(this.container.x, this.container.y - 70);

        this.changeHp(-dmg);

        this.statusNotifications.showDmg(dmg,'right')

        if (this.hp > 0) {
            if (this.isMounted && this.checkLooseHorse()) {
                await this.looseHorse()
            } else {
                if (options?.stun) {
                    this.setUnconscious(options.stun, false)
                } else {
                    if (!this.isUnconscious) {
                        await this.runAnimationOnce(CharAnimation.DAMAGED)
                        this.setAnimation(CharAnimation.IDLE)
                    }
                }
            }
        } else {
            if (this.isUnconscious) {
                this.setUnconscious(999, false)
                // throw Error('cant damage already defeated character')
            } else {
                this.setUnconscious(9999)
            }
        }
    }

    async looseHorse() {
        this.isMounted = false
        this.isDeMounted = true
        this.evasion = 0
        await this.runAnimationOnce(CharAnimation.FALL)
        this.sprite.destroy()
        this.createSprite(0, 0, 'shieldman')
        this.setAnimation(CharAnimation.IDLE)

        this.directToTarget(o_.troll)

        const horse = new Horse(this.container.x, this.container.y)
        horse.runAway()
    }

    async acquireHorse() {
        this.setAnimation(CharAnimation.IDLE);
        const horse = new Horse(positioner.bridgePosition().width + 200, this.container.y)
        await horse.runToChar(this)
        this.isDeMounted = false
        this.isMounted = true
        this.sprite.destroy()
        this.createSprite(0, 0, 'knight')
        this.setAnimation(CharAnimation.IDLE);
    }

    checkLooseHorse() {
        return true
    }

    async runAnimationOnce(anim: CharAnimation) {
        const p = createPromiseAndHandlers()
        this.setAnimation(anim, false, p.done)
        return p.promise
    }

    directToTarget(target: Vec) {
        o_.render.directToTarget(this.sprite, {x: target.x - this.container.x, y: target.y - this.container.y});
    }

    startAttack(forced = false) {
        if (o_.troll.hp > 0 || forced) {
            this.setState(CharStateKey.BATTLE_ATTACK);
        } else {
            this.endAttack();
        }
    }

    endAttack() {
        this.onAttackEnd();
        this.setState(CharStateKey.BATTLE_IDLE);
    }

    tornApart() {
        this.dropAll()
        this.dropSelfMeat(foodConfig.FOOD_FROM_CHARACTER)
        o_.characters.removeChar(this.id)
        eventBus.emit(Evt.CHAR_TORN_APART, this.key)
        o_.audio.playSound(SOUND_KEY.TORN);
    }

    attackPromise = new Promise(() => {})
    onAttackEnd: any = () => {}

    async performBattleAction(pauseTime = 600, forced = false) {
        await pause(pauseTime)

        if (this.isRanged) {
            const p = createPromiseAndHandlers()
            this.setAnimation(CharAnimation.STRIKE, false, p.done)
            await p.promise

            this.setAnimation(CharAnimation.IDLE, false, p.done)

            const arrow = o_.render.createSprite('arrow', this.container.x, this.container.y - 70)
            o_.render.directToTarget(arrow, o_.troll)
            await o_.render.flyTo(arrow, {x: o_.troll.x, y: o_.troll.y - 50}, 750)
            o_.troll.getHit(this.rollDmg())
            arrow.destroy()
        } else {
            this.attackPromise = new Promise(res => this.onAttackEnd = res)
            this.startAttack(forced);
            await this.attackPromise;
        }
    }

    async performFatality() {
        await this.setState(CharStateKey.GO_TO, {target: o_.troll, directToTarget: true, maxDistance: 70})

        const p = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.STRIKE, false, p.done)
        await p.promise
        o_.troll.burstBlood()
        o_.audio.playSound(SOUND_KEY.HIT);
        this.setAnimation(CharAnimation.IDLE)
        await pause(500)

        const p1 = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.STRIKE, false, p1.done)
        await p1.promise
        o_.troll.burstBlood()
        o_.audio.playSound(SOUND_KEY.HIT);
        this.setAnimation(CharAnimation.IDLE)

        await pause(500)

        const p2 = createPromiseAndHandlers()
        this.setAnimation(CharAnimation.STRIKE, false, p2.done)
        await p2.promise
        o_.troll.burstBlood()
        o_.audio.playSound(SOUND_KEY.HIT);
        this.setAnimation(CharAnimation.IDLE)

        await pause(1000)

        o_.troll.getLastHit()
    }

    async performCounterAttack() {
        this.statusNotifications.showCounterAttack()
        return this.performBattleAction(300)
    }

    async evade() {
        this.statusNotifications.showEvade()
        const oldSpeed = this.speed
        this.speed = this.speed * 3
        await this.setState(CharStateKey.GO_TO, {target: {x: this.container.x + 200, y: this.container.y}, speed: this.speed, directToTarget: true})
        this.speed = oldSpeed
    }

    canProtect(char: Char) {
        return this.getIsAbleToFight()
            && this.isDefender
            && char.id !== this.id
            && char.key !== this.key
    }

    canCounterAttack() {
        return !!this.counterAttack && !this.isUnconscious && !this.isSurrender && this.isAlive
    }

    getDefenderPosition(): Vec {
        return {x: this.container.x - 100, y: this.container.y}
    }

    getCoordsToThrowInto(): Vec {
        return {x: this.container.x, y: this.container.y - 80}
    }

    movePromise = new Promise(stub)
    onMoveEnd: any = stub

    goDefend(target: Char) {
        return this.setState(CharStateKey.BATTLE_GO_DEFEND, {target})
    }

    goToBattlePosition() {
        return this.setState(CharStateKey.GO_TO_BATTLE_POSITION)
    }

    goToSurrenderPosition() {
        if (!this.squad || !this.squadPlace) return {promise: Promise.resolve(), stop: stub}
        const target = this.squad.getSurrenderPositionForPlace(this.squadPlace)

        this.setAnimation(CharAnimation.WALK)
        return o_.render.moveTo(this.container, target, this.speed)
    }

    setUnconscious(duration: number, withAnimation = true) {
        return this.setState(CharStateKey.UNCONSCIOUS, {duration, withAnimation})
    }

    say(text: string) {
        flyingStatusChange(text, this.container.x, this.container.y - 100)
    }

    getBattleCoords(): Vec {
        if (this.squad === null || this.squadPlace === null) throw Error('no squad assigned, cant find battle coords')

        return this.squad.getBattleCoordsForPlace(this.squadPlace)
    }

    getIsCovered(): boolean {
        if (!this.squad) return false
        if (this.squadPlace === null) throw Error('wtf')

        switch (this.squadPlace) {
            case 0:
                return false
            case 1:
                return false
            case 2:
                return false
            case 3:
                return this.squad.placeToChar[0]?.getIsAbleToFight()
            case 4:
                return this.squad.placeToChar[1]?.getIsAbleToFight()
            case 5:
                return this.squad.placeToChar[2]?.getIsAbleToFight()
        }
    }
}