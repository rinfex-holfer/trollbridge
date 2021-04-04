import {resoursePaths} from "../resourse-paths";
import {render} from "./render";
import {getGameSize} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";
import {FoodStorage} from "./food-storage";
import {ResourceKey, Resources} from "../types";
import {eventBus, Evt} from "../event-bus";
import {charManager} from "./char-manager";
import {WaitButton} from "../interface/wait-button";
import {Container} from "../type-aliases";

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
            ...this.getLairPosition(),
            container,
            entityId: Lair.CONTAINER_ID + '_tiles'
        })

        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', trollManager.goToLair)

        this.foodStorage.init(this.getFoodStoragePosition());

        this.waitButton = new WaitButton(this.getLairPosition())

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

    getLairPosition() {
        const gameSize = getGameSize();
        return {
            width: gameSize.width,
            height: gameSize.height / 2,
            x: 0,
            y: gameSize.height / 2,
        }
    }

    feedChar(id: string) {
        if (this.resources.food === 0) {
            console.error('no food to feed', id)
            return;
        }
        this.changeResource(ResourceKey.FOOD, -1);
        charManager.feedChar(id);
    }

    makeFoodFrom(id: string) {
        this.changeResource(ResourceKey.FOOD, 3);
        charManager.makeCharGiveAll(id);
        charManager.removeChar(id);
    }

    getFoodStoragePosition() {
        const pos = this.getLairPosition();
        return {
            x: pos.x + 50,
            y: pos.y + pos.height * 3 / 4
        }
    }

    getPrisonerPosition() {
        const pos = this.getLairPosition();
        const prisonersAmount = charManager.getPrisoners().length
        return {
            x: pos.x + pos.width / 2 + prisonersAmount * 50,
            y: pos.y + pos.height * 0.5
        }
    }
}

export const lair = new Lair();