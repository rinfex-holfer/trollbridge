import {TileSprite} from "./render";
import {stub} from "../utils/utils-misc";
import {ResourceKey, Resources} from "../types";
import {eventBus, Evt} from "../event-bus";
import {characters} from "./characters";
import {WaitButton} from "../interface/wait-button";
import {positioner} from "./positioner";

class Lair {
    static CONTAINER_ID = 'lair'

    // foodStorage = new FoodStorage()

    // @ts-ignore
    waitButton: WaitButton

    resources: Resources = {
        [ResourceKey.FOOD]: 0,
        [ResourceKey.GOLD]: 0,
        [ResourceKey.MATERIALS]: 0
    }

    // @ts-ignore
    sprite: TileSprite

    init() {
        const pos = positioner.getLairPosition();
        this.sprite = new TileSprite('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.sprite.onClick(() => this.onClick())

        // this.foodStorage.init(positioner.getFoodStoragePosition());

        this.waitButton = new WaitButton(positioner.getLairPosition())
    }

    onClick: (() => void) = stub

    enableInterface() {
        this.sprite.setInteractive(true, {cursor: 'pointer'});

        this.waitButton.enable()
    }

    disableInterface(completely?: boolean) {
        this.sprite.setInteractive(false);

        if (completely) this.waitButton.disable()
    }

    changeResource(key: ResourceKey, val: number) {
        this.resources[key] = Math.max(this.resources[key] + val, 0)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    // feedChar(id: string) {
    //     if (this.resources.food === 0) {
    //         console.error('no food to feed', id)
    //         return;
    //     }
    //     this.changeResource(ResourceKey.FOOD, -1);
    //     characters.feedChar(id);
    // }
    //
    // makeFoodFrom(id: string) {
    //     this.changeResource(ResourceKey.FOOD, 3);
    //     characters.makeCharGiveAll(id);
    //     characters.removeChar(id);
    // }
}

export const lair = new Lair();