import {CharKey, ResourceKey} from "../../types";
import {charTemplates} from "../../char-templates";
import {createId, stub} from "../../utils/utils-misc";
import {CharState} from "./states/CharState";
import {CharStateIdle} from "./states/CharStateIdle";
import {CharStateGoAcross} from "./states/CharStateGoAcross";
import {CharAnimation, CharStateKey} from "./char-constants";
import {CharActionsMenu} from "../../interface/char-actions-menu";
import {CharStateSurrender} from "./states/CharStateSurrender";
import {CharStateDead} from "./states/CharStateDead";
import {CharStateBones} from "./states/CharStateBones";
// import {CharStatePrisoner} from "./states/CharStatePrisoner";
import {CharSpeakText} from "../../interface/char-speak-text";
import {eventBus, Evt} from "../../event-bus";
import {CharStateGoToTalk} from "./states/CharStateGoToTalk";
import {colorsCSS, gameConstants} from "../../constants";
import {SOUND_KEY} from "../../managers/core/audio";
import {CharStateBattleIdle} from "./states/CharStateBattleIdle";
import {clamp, rndBetween, Vec} from "../../utils/utils-math";
import {createPromiseAndHandlers, pause} from "../../utils/utils-async";
import {CharStateBattleAttack} from "./states/CharStateBattleAttack";
import {flyingStatusChange} from "../../interface/basic/flying-status-change";
import {CharStateBattleSurrender} from "./states/CharStateBattleSurrender";
import {CharHpIndicator} from "../../interface/char-hp-indicator";
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
import {charTexts} from "../../char-texts";

export class Char {
    key: CharKey
    id: string
    hp: number
    maxHp: number
    morale: number
    maxMorale: number
    moralePrice: number
    name: string
    dmg = 0

    speed = gameConstants.CHAR_SPEED * 3

    food: number
    gold: number
    goldInitial: number

    isUnconscious = false
    isAlive = true
    isPrisoner = false
    isFleeing = false
    isSurrender = false
    isBones = false
    isMetTroll = false

    isCombatant: boolean
    isCounterAttacker: boolean
    isDefender: boolean
    isRanged: boolean
    isMounted: boolean

    state: CharState
    timeWithoutFood = 0

    actionsMenu: CharActionsMenu
    speakText: CharSpeakText
    hpIndicator: CharHpIndicator
    mpIndicator: CharMpIndicator

    sprite: O_AnimatedSprite
    bones: O_Sprite
    container: O_Container

    unsub: (() => void)[] = []

    positionBeforeBattle: Vec = {x: 0, y: 0}

    constructor(key: CharKey, x: number, y: number) {
        const charTemplate = charTemplates[key]

        this.id = createId(key)
        this.key = key

        this.hp = charTemplate.hp
        this.maxHp = charTemplate.hp
        this.morale = charTemplate.morale
        this.maxMorale = charTemplate.morale
        this.moralePrice = charTemplate.moralePrice

        this.name = charTemplate.name
        this.isCombatant = charTemplate.isCombatant
        this.dmg = charTemplate.dmg;

        this.isCounterAttacker = !!charTemplate.canCounterAttack
        this.isDefender = !!charTemplate.isDefender
        this.isRanged = !!charTemplate.isRanged
        this.isMounted = !!charTemplate.isMounted

        const {gold, food} = charTemplate.createResources()
        this.gold = gold
        this.goldInitial = gold
        this.food = food

        this.container = o_.render.createContainer(x, y)
        this.container.addPhysics()

        this.sprite = this.createSprite(0, 0)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)

        this.bones = this.createBones()
        this.bones.setVisibility(false);

        this.actionsMenu = new CharActionsMenu(this);
        this.speakText = new CharSpeakText(this.container);
        this.hpIndicator = new CharHpIndicator(this);
        this.mpIndicator = new CharMpIndicator(this);

        this.state = this.getState(CharStateKey.GO_ACROSS)
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
    getIsFighter() { return this.getIsTraveller() && !this.isSurrender && !this.isUnconscious }
    getIsPrisoner() { return this.isAlive && this.isPrisoner; }

    onCharDefeated(key: CharKey) {
        if (this.getIsFighter()) {
            this.changeMp(-charTemplates[key].moralePrice)
        }
    }

    onCharDevoured(key: CharKey) {
        if (this.getIsFighter()) {
            this.changeMp(-charTemplates[key].moralePrice)
        }
    }

    destroy() {
        // this.actionsMenu.destroy();
        this.unsub.forEach(f => f());
        this.state.end();
        this.speakText.destroy();
        this.container.destroy();
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
                return new CharStateSurrender(this);
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
            case CharStateKey.BATTLE_SURRENDER:
                return new CharStateBattleSurrender(this);
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
        console.log(stateKey)
        this.state.end();
        this.state = this.getState(stateKey, options)
        return this.state.start();
    }

    createSprite(x: number, y: number, atlasKey = charTemplates[this.key].atlasKey) {
        const sprite = o_.render.createAnimatedSprite({
            // @ts-ignore
            atlasKey,
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 8},
                {framesPrefix: CharAnimation.FALL, frameRate: 4},
                {framesPrefix: CharAnimation.STRIKE, frameRate: 8},
                {framesPrefix: CharAnimation.DAMAGED, frameRate: 8},
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
        this.actionsMenu.hide()
    }

    enableInteractivity() {
        if (this.isBones) return;
        this.container.setInteractive(true)
        this.actionsMenu.checkIsHovered()
        this.actionsMenu.show()
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

        this.actionsMenu.updateButtons()
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
        const amount = Math.ceil(this.gold * 0.33);
        this.dropGold(amount)
    }

    eat() {
        this.timeWithoutFood = 0;
    }

    giveAll() {
        this.dropGold(this.gold)
        this.dropFood(this.food)
    }

    dropGold(amount: number) {
        this.changeResources(ResourceKey.GOLD, -amount);

        while (amount) {
            const goldInSprite = Math.min(amount, gameConstants.MAX_GOLD_IN_SPRITE)
            amount -= goldInSprite
            let coord = this.getCoords();
            coord.x += rndBetween(-40, 40)
            coord.y += rndBetween(-40, 40)
            const gold = new Gold(this.getCoords(), goldInSprite)
            gold.throwTo(coord)
        }
    }

    dropFood(amount: number) {
        this.changeResources(ResourceKey.FOOD, -amount);

        while (amount) {
            amount--
            const coord = this.getCoords()
            coord.x += rndBetween(-80, 80)
            coord.y += (-this.sprite.height / 2) + rndBetween(-80, 80)

            const meat = new Meat(this.getCoords(), MeatLocation.GROUND)
            meat.throwTo(coord)
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

    setIndicatorsVisible(val: boolean) {
        if (val) {
            this.hpIndicator.show();
            this.mpIndicator.show();
        } else {
            this.hpIndicator.hide();
            this.mpIndicator.hide();
        }
    }

    surrender() {
        this.setIndicatorsVisible(false)

        flyingStatusChange('Сдаюсь, пощади!', this.container.x, this.container.y - 100)

        if (o_.battle.isBattle) {
            return this.setState(CharStateKey.BATTLE_SURRENDER);
        } else {
            return this.setState(CharStateKey.SURRENDER);
        }
    }

    becomeDevoured() {
        if (o_.battle.isBattle) {
            eventBus.emit(Evt.CHAR_DEVOURED_IN_BATTLE, this.key)
        }
        o_.audio.playSound(SOUND_KEY.TORN);
        this.giveAll()
        this.dropSelfMeat(gameConstants.FOOD_FROM_DEVOURED_CHARACTER)
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
        return this.setState(CharStateKey.GO_ACROSS);
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

    rollDmg() {
        return this.dmg + rndBetween(0, Math.ceil(this.dmg * 0.33));
    }

    changeMp(val: number) {
        this.morale = clamp(this.morale+val, 0, this.maxMorale);
        this.mpIndicator.update();

        flyingStatusChange(
            ''+val + ' morale',
            this.container.x,
            this.container.y - 70,
            colorsCSS.BLUE
        );

        if (!this.isSurrender && this.morale <= 0) {
            this.surrender();
        }
    }

    changeHp(val: number) {
        this.hp = clamp(this.hp+val, 0, this.maxHp);
        this.hpIndicator.update();
    }

    async getHit(dmg: number, options?: DmgOptions) {
        o_.audio.playSound(SOUND_KEY.HIT);
        o_.render.burstBlood(this.container.x, this.container.y - 70);

        this.changeHp(-dmg);

        flyingStatusChange(
            '-'+dmg,
            this.container.x,
            this.container.y - 100,
            colorsCSS.RED
        );

        if (this.hp > 0) {
            if (this.isMounted && this.checkLooseHorse()) {
                this.isMounted = false
                await this.runAnimationOnce(CharAnimation.FALL)
                this.sprite.destroy()
                this.createSprite(0, 0, 'shieldman')
                this.setAnimation(CharAnimation.IDLE)

                this.directToTarget(o_.troll)

                new Horse(this.container.x, this.container.y)
            } else {
                if (options?.stun) {
                    this.setState(CharStateKey.UNCONSCIOUS, {duration: options.stun, withAnimation: false})
                } else {
                    await this.runAnimationOnce(CharAnimation.DAMAGED)
                    this.setAnimation(CharAnimation.IDLE)
                }
            }
        } else {
            if (this.isUnconscious) {
                this.getKilled()
            } else {
                this.setUnconscious()
            }
        }
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

    startAttack() {
        if (o_.troll.hp > 0) {
            this.setState(CharStateKey.BATTLE_ATTACK);
        } else {
            this.endAttack();
        }
    }

    endAttack() {
        this.onAttackEnd();
        this.setState(CharStateKey.BATTLE_IDLE);
    }

    transformToFood() {
        this.giveAll()
        this.dropSelfMeat(gameConstants.FOOD_FROM_CHARACTER)
        o_.characters.removeChar(this.id)
    }

    attackPromise = new Promise(() => {})
    onAttackEnd: any = () => {}

    async performBattleAction(pauseTime = 600) {
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
            this.startAttack();
            await this.attackPromise;
        }
    }

    async performCounterAttack() {
        flyingStatusChange(
            'Counter-attack!',
            this.container.x,
            this.container.y - this.sprite.height,
            colorsCSS.WHITE
        );
        return this.performBattleAction(0)
    }

    async runAround() {
        const oldSpeed = this.speed
        this.speed = this.speed * 3
        const points = [
            {x: this.container.x - 300, y: this.container.y - 200},
            {x: this.container.x - 600, y: this.container.y},
            {x: this.container.x - 300, y: this.container.y + 200},
            {x: this.container.x, y: this.container.y},
        ]
        for (let i = 0; i < points.length; i++) {
            await this.setState(CharStateKey.GO_TO, {target: points[i], speed: this.speed})
        }
        this.speed = oldSpeed
    }

    canProtect(char: Char) {
        return this.isDefender
            && char.id !== this.id
            && char.key !== this.key
    }

    canCounterAttack() {
        return this.isCounterAttacker && !this.isUnconscious && !this.isSurrender && this.isAlive
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
        this.setState(CharStateKey.BATTLE_GO_DEFEND, {target})
        return this.movePromise
    }

    goToBattlePosition() {
        this.setState(CharStateKey.GO_TO_BATTLE_POSITION)
        return this.movePromise
    }

    setUnconscious() {
        return this.setState(CharStateKey.UNCONSCIOUS, {duration: 999, withAnimation: true})
    }

    say(text: string) {
        flyingStatusChange(text, this.container.x, this.container.y - 100)
    }
}