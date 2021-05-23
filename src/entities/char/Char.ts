import {CharKey, ResourceKey, Resources} from "../../types";
import {charTemplates} from "../../char-templates";
import {createId} from "../../utils/utils-misc";
import {CharState} from "./states/CharState";
import {CharStateIdle} from "./states/CharStateIdle";
import {CharStateGoAcross} from "./states/CharStateGoAcross";
import {CharAnimation, CharStateKey} from "./char-constants";
import {CharActionsMenu} from "../../interface/char-actions-menu";
import {CharStateSurrender} from "./states/CharStateSurrender";
import {CharStateDead} from "./states/CharStateDead";
import {CharStateBones} from "./states/CharStateBones";
import {CharStatePrisoner} from "./states/CharStatePrisoner";
import {CharSpeakText} from "../../interface/char-speak-text";
import {eventBus, Evt} from "../../event-bus";
import {CharStateGoToTalk} from "./states/CharStateGoToTalk";
import {colorsCSS, gameConstants} from "../../constants";
import {SOUND_KEY} from "../../managers/core/audio";
import {CharStateBattleIdle} from "./states/CharStateBattleIdle";
import {clamp, rndBetween, Vec} from "../../utils/utils-math";
import {pause} from "../../utils/utils-async";
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

export class Char {
    key: CharKey
    id: string
    hp: number
    maxHp: number
    morale: number
    maxMorale: number
    moralePrice: number
    name: string
    isCombatant: boolean
    dmg = 0

    speed = gameConstants.CHAR_SPEED * 3
    resources: Resources
    isUnconscious = false
    isAlive = true
    isPrisoner = false
    isFleeing = false
    isSurrender = false
    isBones = false
    isMetTroll = false

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
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant
        this.dmg = charTemplate.dmg;

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
        this.state.onStart();

        const subId = eventBus.on(Evt.ENCOUNTER_ENDED, () => this.hpIndicator.hide())
        this.unsub.push(() => eventBus.unsubscribe(Evt.ENCOUNTER_ENDED, subId))

        const subId2 = eventBus.on(Evt.CHAR_DEFEATED, (key) => this.onCharDefeated(key))
        this.unsub.push(() => eventBus.unsubscribe(Evt.CHAR_DEFEATED, subId2))

        const subId3 = eventBus.on(Evt.CHAR_DEVOURED_IN_BATTLE, (key) => this.onCharDevoured(key))
        this.unsub.push(() => eventBus.unsubscribe(Evt.CHAR_DEVOURED_IN_BATTLE, subId3))
    }

    getIsNewTraveller() { return !this.isMetTroll }
    getIsTraveller() { return this.isAlive && !this.isPrisoner }
    getIsFighter() { return this.getIsTraveller() && !this.isSurrender }
    getIsPrisoner() { return this.isAlive && this.isPrisoner; }

    onCharDefeated(key: CharKey) {
        if (this.getIsFighter()) {
            this.changeMp(-charTemplates[key].moralePrice)
        }
    }

    onCharDevoured(key: CharKey) {
        if (this.getIsFighter()) {
            this.changeMp(-charTemplates[key].moralePrice * 2)
        }
    }

    destroy() {
        // this.actionsMenu.destroy();
        this.unsub.forEach(f => f());
        this.state.onEnd();
        this.speakText.destroy();
        this.container.destroy();
    }

    update(dt: number) {
        this.state.update(dt);
    }

    getState(stateKey: CharStateKey): CharState {
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
            case CharStateKey.PRISONER:
                return new CharStatePrisoner(this);
            case CharStateKey.GO_TO_TALK:
                return new CharStateGoToTalk(this);
            case CharStateKey.BATTLE_IDLE:
                return new CharStateBattleIdle(this);
            case CharStateKey.BATTLE_ATTACK:
                return new CharStateBattleAttack(this);
            case CharStateKey.BATTLE_SURRENDER:
                return new CharStateBattleSurrender(this);
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    setState(stateKey: CharStateKey) {
        this.state.onEnd();
        this.state = this.getState(stateKey)
        this.state.onStart();
    }

    createSprite(x: number, y: number) {
        const atlasKey = charTemplates[this.key].atlasKey;
        const sprite = o_.render.createAnimatedSprite({
            // @ts-ignore
            atlasKey,
            animations:  [
                {framesPrefix: CharAnimation.WALK, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.IDLE, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.DEAD, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.STRIKE, frameRate: 4},
                {framesPrefix: CharAnimation.PRISONER, repeat: -1, frameRate: 4},
                {framesPrefix: CharAnimation.SURRENDER, repeat: -1, frameRate: 4},
            ],
            x,
            y,
            parent: this.container
        })
        sprite.setOrigin(0.5, 1);
        return sprite;
    }

    disableInteractivity() {
        this.container.setInteractive(false);
        this.actionsMenu.hide()
    }

    enableInteractivity() {
        if (this.isBones) return;
        this.container.setInteractive(true);
        this.actionsMenu.checkIsHovered();
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
        this.resources[key] = Math.max(this.resources[key] + val, 0)
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
        const amount = Math.ceil(this.resources.gold * 0.33);
        this.changeResources(ResourceKey.GOLD, -amount);
        o_.lair.changeResource(ResourceKey.GOLD, amount)
    }

    eat() {
        this.timeWithoutFood = 0;
    }

    giveAll() {
        o_.lair.changeResource(ResourceKey.GOLD, this.resources[ResourceKey.GOLD])
        o_.lair.changeResource(ResourceKey.MATERIALS, this.resources[ResourceKey.MATERIALS])
        o_.lair.changeResource(ResourceKey.FOOD, this.resources[ResourceKey.FOOD])

        this.changeResources(ResourceKey.GOLD, -this.resources[ResourceKey.GOLD]);
        this.changeResources(ResourceKey.MATERIALS, -this.resources[ResourceKey.MATERIALS]);
        this.changeResources(ResourceKey.FOOD, -this.resources[ResourceKey.FOOD]);
    }

    surrender() {
        this.hpIndicator.hide();
        this.mpIndicator.hide();

        if (o_.battle.isBattle) {
            this.setState(CharStateKey.BATTLE_SURRENDER);
        } else {
            this.setState(CharStateKey.SURRENDER);
        }
    }

    becomeDevoured() {
        if (o_.battle.isBattle) {
            eventBus.emit(Evt.CHAR_DEVOURED_IN_BATTLE, this.key)
        }
        o_.audio.playSound(SOUND_KEY.TORN);
        this.toBones();
    }

    toBones() {
        this.setState(CharStateKey.BONES);
    }

    setAnimation(key: CharAnimation, loop?: boolean, onComplete?: () => void) {
        this.sprite.play(key, onComplete && {onComplete});
    }

    goToTalk() {
        this.setState(CharStateKey.GO_TO_TALK);
    }

    readyToTalk() {
        this.isMetTroll = true;
        this.setState(CharStateKey.IDLE);
        eventBus.emit(Evt.CHAR_READY_TO_TALK, this.id);
    }

    makeImprisoned() {
        this.setState(CharStateKey.PRISONER);
    }

    getKilled() {
        this.setState(CharStateKey.DEAD);
    }

    goAcrossBridge() {
        this.setState(CharStateKey.GO_ACROSS);
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
        return this.dmg + rndBetween(1, 5);
    }

    changeMp(val: number) {
        this.morale = clamp(this.morale+val, 0, this.maxMorale);
        this.mpIndicator.update();

        flyingStatusChange(
            ''+val,
            this.sprite.x,
            this.sprite.y - this.sprite.height,
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

    getHit(dmg: number) {
        o_.audio.playSound(SOUND_KEY.HIT);
        o_.render.burstBlood(this.container.x, this.container.y);

        this.changeHp(-dmg);

        flyingStatusChange(
            '-'+dmg,
            this.container.x,
            this.container.y - this.container.height,
            colorsCSS.RED
        );

        if (this.hp <= 0) {
            if (!this.isSurrender) {
                this.surrender();
                eventBus.emit(Evt.CHAR_DEFEATED, this.key)
            } else {
                this.getKilled()
            }
        }
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

    attackPromise = new Promise(() => {})
    onAttackEnd: any = () => {}

    async performBattleAction() {
        await pause(300)

        this.attackPromise = new Promise(res => this.onAttackEnd = res)

        this.startAttack();

        return this.attackPromise;
    }
}