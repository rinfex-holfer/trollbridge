import {CharKey, ResourceKey, Resources} from "../types";
import {charTemplates} from "../char-templates";
import {createId} from "../utils/utils-misc";
import {renderManager} from "../managers/render-manager";
import {lair} from "../managers/lair";

export class Char {
    key: CharKey
    id: string
    hp: number
    name: string
    isCombatant: boolean

    resources: Resources
    isUnconscious: boolean = false
    isAlive: boolean = true

    constructor(key: CharKey, x: number, y: number) {
        const charTemplate = charTemplates[key]

        this.id = createId(key);
        this.key = key
        this.hp = charTemplate.hp
        this.name = charTemplate.name
        this.resources = charTemplate.createResources()
        this.isCombatant = charTemplate.isCombatant

        this.createAnimation(x, y);
    }

    createAnimation(x: number, y: number) {
        const a = renderManager.createAnimation({
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
        console.log(123123, a);
    }

    destroy() {
        renderManager.destroyAnimation(this.id);
    }

    changeResources(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
    }

    pay() {
        const amount = Math.ceil(this.resources.gold * 0.33);
        this.changeResources(ResourceKey.GOLD, -amount);
        lair.changeResource(ResourceKey.GOLD, amount)
    }

    giveAll() {
        lair.changeResource(ResourceKey.GOLD, this.resources[ResourceKey.GOLD])
        lair.changeResource(ResourceKey.MATERIALS, this.resources[ResourceKey.MATERIALS])
        lair.changeResource(ResourceKey.FOOD, this.resources[ResourceKey.FOOD])

        this.changeResources(ResourceKey.GOLD, -this.resources[ResourceKey.GOLD]);
        this.changeResources(ResourceKey.MATERIALS, -this.resources[ResourceKey.MATERIALS]);
        this.changeResources(ResourceKey.FOOD, -this.resources[ResourceKey.FOOD]);
    }
}