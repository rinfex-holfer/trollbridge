import {resoursePaths} from "../resourse-paths";
import {render} from "./render";
import {getGameSize} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {FoodStorage} from "./food-storage";
import {ResourceKey, Resources} from "../types";
import {eventBus, Evt} from "../event-bus";
import {characters} from "./characters";
import {WaitButton} from "../interface/wait-button";
import {Container} from "../type-aliases";
import {positioner} from "./positioner";

class Lair {
    static CONTAINER_ID = 'lair'

    foodStorage = new FoodStorage()

    // @ts-ignore
    waitButton: WaitButton
    // @ts-ignore
    container: Container

    resources: Resources = {
        [ResourceKey.FOOD]: 0,
        [ResourceKey.GOLD]: 0,
        [ResourceKey.MATERIALS]: 0
    }

    init() {
        const container = render.createContainer(Lair.CONTAINER_ID)
        this.container = container;

        render.createTiles({
            paths: [resoursePaths.images.grass],
            ...positioner.getLairPosition(),
            container,
            entityId: Lair.CONTAINER_ID + '_tiles'
        })

        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', () => trollManager.goToLair())

        this.foodStorage.init(positioner.getFoodStoragePosition());

        this.waitButton = new WaitButton(positioner.getLairPosition())

        eventBus.on(Evt.ENCOUNTER_ENDED, () => this.enableInterface())
        eventBus.on(Evt.ENCOUNTER_STARTED, () => this.disableInterface())
    }

    enableInterface() {
        this.container.interactive = true;
        this.container.buttonMode = true;

        this.waitButton.enable()
    }

    disableInterface() {
        this.container.interactive = false;
        this.container.buttonMode = false;

        this.waitButton.disable()
    }

    changeResource(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    feedChar(id: string) {
        if (this.resources.food === 0) {
            console.error('no food to feed', id)
            return;
        }
        this.changeResource(ResourceKey.FOOD, -1);
        characters.feedChar(id);
    }

    makeFoodFrom(id: string) {
        this.changeResource(ResourceKey.FOOD, 3);
        characters.makeCharGiveAll(id);
        characters.removeChar(id);
    }


}

export const lair = new Lair();