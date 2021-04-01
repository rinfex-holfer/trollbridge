import {resoursePaths} from "../resourse-paths";
import {renderManager} from "./render-manager";
import {getGameSize} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {FoodStorage} from "./food-storage";

class Lair {
    static CONTAINER_ID = 'lair'

    foodStorage: FoodStorage = new FoodStorage();

    init() {
        const container = renderManager.createContainer(Lair.CONTAINER_ID)

        renderManager.createTiles({
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