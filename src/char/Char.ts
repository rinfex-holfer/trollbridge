import {CharKey, ResourceKey, Resources} from "../types";
import {charTemplates} from "../char-templates";
import {createId} from "../utils/utils-misc";
import {render} from "../managers/render";
import {lair} from "../managers/lair";
import {CharState} from "./states/CharState";
import {CharStateIdle} from "./states/CharStateIdle";
import {CharStateGoAcross} from "./states/CharStateGoAcross";
import {CharAnimation, CharStateKey} from "./char-constants";
import {CharActionsMenu} from "../interface/char-actions-menu";
import {CharStateSurrender} from "./states/CharStateSurrender";
import {CharStateDead} from "./states/CharStateDead";
import {CharStateBones} from "./states/CharStateBones";
import {resoursePaths} from "../resourse-paths";
import {CharStatePrisoner} from "./states/CharStatePrisoner";
import {Container} from "../type-aliases";
import {CharSpeakText} from "../interface/char-speak-text";
import {eventBus, Evt} from "../event-bus";
import {CharStateGoToTalk} from "./states/CharStateGoToTalk";
import {colors, gameConstants} from "../constants";
import {audioManager, SOUND_KEY} from "../managers/audio";
import {CharStateBattleIdle} from "./states/CharStateBattleIdle";
import {trollManager} from "../managers/troll-manager";
import {clamp, rndBetween} from "../utils/utils-math";
import {pause} from "../utils/utils-async";
import {particleManager} from "../managers/particles";
import {CharStateBattleAttack} from "./states/CharStateBattleAttack";
import {flyingStatusChange} from "../interface/basic/flying-status-change";
import {CharStateBattleSurrender} from "./states/CharStateBattleSurrender";
import {battleManager} from "../managers/battle";
import {CharHpIndicator} from "../interface/char-hp-indicator";
import {CharMpIndicator} from "../interface/char-mp-indicator";

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

    container: Container

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

        this.container = this.createAnimation(x, y);
        this.createBones();

        this.actionsMenu = new CharActionsMenu(this.id);
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
        this.unsub.forEach(f => f());
        this.state.onEnd();
        this.actionsMenu.destroy();
        render.removeSprite(this.id + '_bones')
        render.destroyAnimation(this.id);
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

    createAnimation(x: number, y: number) {
        render.createAnimation({
            path: charTemplates[this.key].animationsPath,
            animationSpeed: 0.1,
            currentAnimation: 'walk',
            entityId: this.id,
            x: x,
            y: y,
            ySorting: true,
            autoplay: true,
            anchor: {x: 0.5, y: 1}
        })

        render.setInteractive(this.id, true, false);
        const cont = render.getContainer(this.id);

        return cont;
    }

    disableInteractivity() {
        this.container.interactive = false;
        this.container.interactiveChildren = false;
        this.actionsMenu.hide()
    }

    enableInteractivity() {
        if (this.isBones) return;
        this.container.interactive = true;
        this.container.interactiveChildren = true;
        this.actionsMenu.checkIsHovered();
    }

    createBones() {
        const container = render.getContainer(this.id);
        render.createSprite({
            entityId: this.id + '_bones',
            path: resoursePaths.images.bones,
            visible: false,
            x: 0,
            y: 0,
            container,
            anchor: {x: 0.5, y: 0.5}
        })
    }

    getCoords() {
        const cont = render.getContainer(this.id);
        return {x: cont.x, y: cont.y};
    }

    changeResources(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
    }

    moveTowards(dt: number, x: number, y: number, directToTarget?: boolean): number {
        const distanceLeft = render.moveTowards(
            this.id,
            x,
            y,
            dt * this.speed / 1000,
            true,
            directToTarget,
        )

        this.syncFlip();

        return distanceLeft;
    }

    pay() {
        const amount = Math.ceil(this.resources.gold * 0.33);
        this.changeResources(ResourceKey.GOLD, -amount);
        lair.changeResource(ResourceKey.GOLD, amount)
    }

    eat() {
        this.timeWithoutFood = 0;
    }

    giveAll() {
        lair.changeResource(ResourceKey.GOLD, this.resources[ResourceKey.GOLD])
        lair.changeResource(ResourceKey.MATERIALS, this.resources[ResourceKey.MATERIALS])
        lair.changeResource(ResourceKey.FOOD, this.resources[ResourceKey.FOOD])

        this.changeResources(ResourceKey.GOLD, -this.resources[ResourceKey.GOLD]);
        this.changeResources(ResourceKey.MATERIALS, -this.resources[ResourceKey.MATERIALS]);
        this.changeResources(ResourceKey.FOOD, -this.resources[ResourceKey.FOOD]);
    }

    surrender() {
        this.hpIndicator.hide();
        this.mpIndicator.hide();

        if (battleManager.isBattle) {
            this.setState(CharStateKey.BATTLE_SURRENDER);
        } else {
            this.setState(CharStateKey.SURRENDER);
        }
    }

    becomeDevoured() {
        if (battleManager.isBattle) {
            eventBus.emit(Evt.CHAR_DEVOURED_IN_BATTLE, this.key)
        }
        audioManager.playSound(SOUND_KEY.TORN);
        this.toBones();
    }

    toBones() {
        this.setState(CharStateKey.BONES);
    }

    setAnimation(key: CharAnimation, loop?: boolean, onComplete?: () => void) {
        render.changeAnimation({
            entityId: this.id,
            animationName: key,
            loop,
            onComplete
        })
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

    syncFlip() {
        this.actionsMenu.container.scale.x = this.container.scale.x;
        this.speakText.text.scale.x = this.container.scale.x;
        this.hpIndicator.text.scale.x = this.container.scale.x;
        this.mpIndicator.text.scale.x = this.container.scale.x;
    }

    speak(text: string) {
        this.speakText.showText(text, 2000);
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
            this.container.x,
            this.container.y - this.container.height,
            colors.BLUE
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
        audioManager.playSound(SOUND_KEY.HIT);
        particleManager.createHitBurst(this.id + '_emitter', this.container.x, this.container.y);

        this.changeHp(-dmg);

        flyingStatusChange(
            '-'+dmg,
            this.container.x,
            this.container.y - this.container.height,
            colors.RED
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

    startAttack() {
        if (trollManager.hp > 0) {
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