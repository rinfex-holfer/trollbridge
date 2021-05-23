import {eventBus, Evt} from "../../event-bus";
import {ResourceKey} from "../../types";
import {Vec} from "../../utils/utils-math";
import {O_Sprite} from "../core/render/sprite";
import {o_} from "../locator";
import {LayerKey} from "../core/layers";
import {O_Container} from "../core/render/container";

export class FoodStorage {
    foodSprites = [] as O_Sprite[];

    unsub = [] as any[]

    position: Vec = {x: 0, y: 0}

    container: O_Container;

    constructor(pos: Vec) {
        this.position = pos;

        this.container =  o_.render.createContainer(0, 0)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)


        const sub = eventBus.on(Evt.RESOURSES_CHANGED, () => this.updateFood());
        this.unsub.push(() => eventBus.unsubscribe(Evt.RESOURSES_CHANGED, sub));

        this.updateFood();
    }

    destroy() {
        this.unsub.forEach(f => f());
    }

    foodClicked() {
        if (o_.lair.resources[ResourceKey.FOOD] > 0) {
            o_.lair.changeResource(ResourceKey.FOOD, -1);
            o_.troll.eat(1);
        }
    }

    updateFood() {
        if (o_.lair.resources[ResourceKey.FOOD] < this.foodSprites.length) {
            while (o_.lair.resources[ResourceKey.FOOD] < this.foodSprites.length) {
                this.foodSprites.pop()?.destroy()
            }
        } else if (o_.lair.resources[ResourceKey.FOOD] > this.foodSprites.length) {
            const lairPos = this.position;

            while (o_.lair.resources[ResourceKey.FOOD] !== this.foodSprites.length) {
                lairPos.x += 25;

                const sprite = o_.render.createSprite(
                    'meat',
                    lairPos.x,
                    lairPos.y,
                    {parent: this.container}
                )

                sprite.setInteractive(true, {cursor: 'pointer'});
                sprite.onClick( () => this.foodClicked())

                this.foodSprites.push(sprite);
            }
        }
    }

    enable() {
        this.foodSprites.forEach(s => s.setInteractive(true))
    }

    disable() {
        this.foodSprites.forEach(s => s.setInteractive(false))
    }
}