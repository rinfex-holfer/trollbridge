import {stub} from "../../utils/utils-misc";
import {ResourceKey, Resources} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {WaitButton} from "../../interface/wait-button";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {Tiles} from "../core/render/tiles";
import {FoodStorage} from "./food-storage";

export class Lair {
    foodStorage: FoodStorage
    waitButton: WaitButton

    resources: Resources = {
        [ResourceKey.FOOD]: 3,
        [ResourceKey.GOLD]: 0,
        [ResourceKey.MATERIALS]: 0
    }

    sprite: Tiles

    constructor() {
        o_.register.lair(this);
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createTiles('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.sprite.onClick(() => this.onClick())

        this.foodStorage = new FoodStorage(positioner.getFoodStoragePosition())

        this.waitButton = new WaitButton(positioner.getLairPosition())
    }

    onClick: (() => void) = stub

    enableInterface() {
        this.sprite.setInteractive(true, {cursor: 'pointer'});

        this.waitButton.enable()
    }

    disableInterface(withButton?: boolean) {
        this.sprite.setInteractive(false);

        if (withButton) this.waitButton.disable()
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
        o_.characters.feedChar(id);
    }

    makeFoodFrom(id: string) {
        this.changeResource(ResourceKey.FOOD, 3);
        o_.characters.makeCharGiveAll(id);
        o_.characters.removeChar(id);
    }
}