import {resoursePaths} from "../resourse-paths";
import {render} from "./render";
import {getGameSize} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {FoodStorage} from "./food-storage";
import {ResourceKey, Resources} from "../types";
import {eventBus, Evt} from "../event-bus";

class Lair {
    static CONTAINER_ID = 'lair'

    foodStorage: FoodStorage = new FoodStorage();

    resources: Resources = {
        [ResourceKey.FOOD]: 0,
        [ResourceKey.GOLD]: 0,
        [ResourceKey.MATERIALS]: 0
    }

    init() {
        const container = render.createContainer(Lair.CONTAINER_ID)

        render.createTiles({
            paths: [resoursePaths.images.grass],
            ...this.getLairPosition(),
            container,
            entityId: Lair.CONTAINER_ID + '_tiles'
        })

        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', trollManager.goToLair)

        this.foodStorage.init(this.getFoodStoragePosition());
    }

    changeResource(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    getLairPosition() {
        const gameSize = getGameSize();
        return {
            width: gameSize.width,
            height: gameSize.height / 2,
            x: 0,
            y: gameSize.height / 2,
        }
    }

    getFoodStoragePosition() {
        const pos = this.getLairPosition();
        return {
            x: pos.x + 50,
            y: pos.y + pos.height * 3 / 4
        }
    }
}

export const lair = new Lair();