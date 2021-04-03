import {render} from "./render";
import {createId} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {resoursePaths} from "../resourse-paths";
import {EntityKey, ResourceKey} from "../types";
import {Vec} from "../utils/utils-math";
import {zLayers} from "../constants";
import {lair} from "./lair";

export class FoodStorage {
    static CONTAINER_ID = 'food-storage'

    foodSprites = [] as string[];

    unsub = [] as any[]

    position: Vec = {x: 0, y: 0}

    init(pos: Vec) {
        this.position = pos;

        const container = render.createContainer(FoodStorage.CONTAINER_ID)
        container.zIndex = zLayers.LAIR_OBJECTS
        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', () => {
            if (gameState.food > 0) {
                lair.changeResource(ResourceKey.FOOD, -1);
                trollManager.eat(1);
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
                // @ts-ignore
                render.removeSprite(this.foodSprites.pop());
            }
        } else if (lair.resources[ResourceKey.FOOD] > this.foodSprites.length) {
            const lairPos = this.position;

            while (lair.resources[ResourceKey.FOOD] !== this.foodSprites.length) {
                const entityId = createId(EntityKey.FOOD);
                lairPos.x += 25;
                render.createSprite({
                    path: resoursePaths.images.meat,
                    ...lairPos,
                    entityId,
                    container: render.getContainer(FoodStorage.CONTAINER_ID)
                })
                this.foodSprites.push(entityId);
            }
        }
    }
}