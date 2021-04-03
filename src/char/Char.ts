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

export class Char {
    key: CharKey
    id: string
    hp: number
    name: string
    isCombatant: boolean

    speed: number = 300
    resources: Resources
    isUnconscious = false
    isAlive = true
    isPrisoner = false
    isFleeing = false
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
        this.name = charTemplate.name
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant

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

        render.setInteractive(this.id, true);
        const cont = render.getContainer(this.id);
        cont.on('mouseover', () => this.actionsMenu.show())
        cont.on('mouseout', () => this.actionsMenu.hide())

        return cont;
    }

    createBones() {
        const container = render.getContainer(this.id);
        render.createSprite({
            entityId: this.id + '_bones',
            path: resoursePaths.images.bones,
            visible: false,
            x: 0,
            y: 0,
            container
        })
    }

    getCoords() {
        const cont = render.getContainer(this.id);
        return {x: cont.x, y: cont.y};
    }

    changeResources(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
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

    toBones() {
        this.setState(CharStateKey.BONES);
    }

    setAnimation(key: CharAnimation) {
        render.changeAnimation({
            entityId: this.id,
            animationName: key
        })
    }

    startNegotiation() {
        this.isMetTroll = true;
        this.setState(CharStateKey.IDLE);
    }

    makeImprisoned() {
        this.setState(CharStateKey.PRISONER);
    }

    kill() {
        this.setState(CharStateKey.DEAD);
    }

    goAcrossBridge() {
        this.setState(CharStateKey.GO_ACROSS);
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
}