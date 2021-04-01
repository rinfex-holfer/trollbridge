import {renderManager} from "./render-manager";
import {createId} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {gameState} from "../game-state";
import {eventBus, Evt} from "../event-bus";
import {resoursePaths} from "../resourse-paths";
import {EntityKey} from "../types";
import {Vec} from "../utils/utils-math";
import {zLayers} from "../constants";

export class FoodStorage {
    static CONTAINER_ID = 'food-storage'

    foodSprites = [] as string[];

    unsub = [] as any[]

    position: Vec = {x: 0, y: 0}

    init(pos: Vec) {
        this.position = pos;

        const container = renderManager.createContainer(FoodStorage.CONTAINER_ID)
        container.zIndex = zLayers.LAIR_OBJECTS
        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', () => {
            if (gameState.food > 0) {
                trollManager.eat();
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
        if (gameState.food < this.foodSprites.length) {
            while (gameState.food < this.foodSprites.length) {
                // @ts-ignore
                renderManager.removeSprite(this.foodSprites.pop());
            }
        } else if (gameState.food > this.foodSprites.length) {
            const lairPos = this.position;

            while (gameState.food !== this.foodSprites.length) {
                const entityId = createId(EntityKey.FOOD);
                lairPos.x += 25;
                renderManager.createSprite({
                    path: resoursePaths.images.meat,
                    ...lairPos,
                    entityId,
                    container: renderManager.getContainer(FoodStorage.CONTAINER_ID)
                })
                this.foodSprites.push(entityId);
            }
        }
    }
}