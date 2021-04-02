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

export class Char {
    key: CharKey
    id: string
    hp: number
    name: string
    isCombatant: boolean

    speed: number = 100
    resources: Resources
    isUnconscious = false
    isAlive = true
    isPrisoner = false
    isFleeing = false

    state: CharState
    timeWithoutFood = 0

    actionsMenu: CharActionsMenu

    constructor(key: CharKey, x: number, y: number) {
        const charTemplate = charTemplates[key]

        this.id = createId(key)
        this.key = key
        this.hp = charTemplate.hp
        this.name = charTemplate.name
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant

        this.createAnimation(x, y);

        this.actionsMenu = new CharActionsMenu(this.id);

        this.state = this.getState(CharStateKey.GO_ACROSS)
        this.state.onStart();
    }

    destroy() {
        this.actionsMenu.destroy();
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

    setAnimation(key: CharAnimation) {
        render.changeAnimation({
            entityId: this.id,
            animationName: key
        })
    }

    startNegotiation() {
        this.setState(CharStateKey.IDLE);
    }

    makeImprisoned() {

    }

    kill() {
        this.setState(CharStateKey.DEAD);
    }

    goAcrossBridge() {
        this.actionsMenu.hide();
        this.setState(CharStateKey.GO_ACROSS);
    }
}