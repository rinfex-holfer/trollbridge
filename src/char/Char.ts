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
import {gameConstants} from "../constants";
import {audioManager, SOUND_KEY} from "../managers/audio";
import {CharStateFightingIdle} from "./states/CharStateFightingIdle";
import {trollManager} from "../managers/troll-manager";
import {rndBetween} from "../utils/utils-math";
import {pause} from "../utils/utils-async";
import {particleManager} from "../managers/particles";
import {CharStateFightingAttack} from "./states/CharStateFightingAttack";

export class Char {
    key: CharKey
    id: string
    hp: number
    morale: number
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

    container: Container

    constructor(key: CharKey, x: number, y: number) {
        const charTemplate = charTemplates[key]

        this.id = createId(key)
        this.key = key
        this.hp = charTemplate.hp
        this.morale = charTemplate.morale
        this.name = charTemplate.name
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant
        this.dmg = charTemplate.dmg;

        this.container = this.createAnimation(x, y);
        this.createBones();

        this.actionsMenu = new CharActionsMenu(this.id);
        this.speakText = new CharSpeakText(this.container);

        this.state = this.getState(CharStateKey.GO_ACROSS)
        this.state.onStart();
    }

    destroy() {
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
            case CharStateKey.FIGHTING_IDLE:
                return new CharStateFightingIdle(this);
            case CharStateKey.FIGHTING_ATTACK:
                return new CharStateFightingAttack(this);
            default:
                throw Error('wrong state key ' + stateKey);
        }
    }

    async setState(stateKey: CharStateKey) {
        await this.state.onEnd();
        this.state = this.getState(stateKey)
        await this.state.onStart();
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
        cont.on('mouseover', () => this.actionsMenu.show())
        cont.on('mouseout', () => this.actionsMenu.hide())

        return cont;
    }

    disableActionsMenu() {
        render.getContainer(this.id).interactiveChildren = false
        render.getContainer(this.id).interactive = false
        this.actionsMenu.hide()
    }

    enableActionsMenu() {
        render.getContainer(this.id).interactiveChildren = true
        render.getContainer(this.id).interactive = true
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
        this.setState(CharStateKey.SURRENDER);
    }

    becomeEaten() {
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
            this.setState(CharStateKey.FIGHTING_IDLE);
        }
    }

    syncFlip() {
        this.actionsMenu.container.scale.x = this.container.scale.x;
        this.speakText.text.scale.x = this.container.scale.x;
    }

    speak(text: string) {
        this.speakText.showText(text);
    }

    clearText() {
        this.speakText.hideText();
    }

    rollDmg() {
        return this.dmg + rndBetween(1, 5);
    }

    getHit(dmg: number) {
        audioManager.playSound(SOUND_KEY.HIT);
        particleManager.createHitBurst(this.id + '_emitter', this.container.x, this.container.y);

        this.hp = Math.max(0, this.hp - dmg);
        if (this.state.key === CharStateKey.SURRENDER && this.hp <= 0) {
            this.getKilled()
        }
    }

    startAttack() {
        if (trollManager.hp > 0) {
            this.setState(CharStateKey.FIGHTING_ATTACK);
        } else {
            this.endAttack();
        }
    }

    endAttack() {
        this.onAttackEnd();
        this.setState(CharStateKey.FIGHTING_IDLE);
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