import {Container, render, Sprite} from "./render";
import {createId} from "../utils/utils-misc";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {EntityKey, ResourceKey} from "../types";
import {Vec} from "../utils/utils-math";
import {lair} from "./lair";
import {getTroll} from "./troll";

export class FoodStorage {
    static CONTAINER_ID = 'food-storage'

    foodSprites = [] as Sprite[];

    unsub = [] as any[]

    position: Vec = {x: 0, y: 0}

    // @ts-ignore
    container: Container;

    init(pos: Vec) {
        this.position = pos;

        const container = new Container(0, 0)
        this.container = container
        // container.zIndex = zLayers.LAIR_OBJECTS
        container.setInteractive(true, {cursor: 'pointer'});
        container.onClick( () => {
            if (gameState.food > 0) {
                lair.changeResource(ResourceKey.FOOD, -1);
                getTroll().eat(1);
            }
        })

        const sub = eventBus.on(Evt.RESOURSES_CHANGED, () => this.updateFood());
        this.unsub.push(() => eventBus.unsubscribe(Evt.RESOURSES_CHANGED, sub));

        this.updateFood();
    }

    destroy() {
        this.unsub.forEach(f => f());
    }

    updateFood() {
        if (lair.resources[ResourceKey.FOOD] < this.foodSprites.length) {
            while (lair.resources[ResourceKey.FOOD] < this.foodSprites.length) {
                this.foodSprites.pop()?.destroy()
            }
        } else if (lair.resources[ResourceKey.FOOD] > this.foodSprites.length) {
            const lairPos = this.position;

            while (lair.resources[ResourceKey.FOOD] !== this.foodSprites.length) {
                lairPos.x += 25;

                this.foodSprites.push(new Sprite(
                    'meat',
                    lairPos.x,
                    lairPos.y,
                    {parent: this.container}
                ));
            }
        }
    }
}