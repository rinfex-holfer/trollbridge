import {ResourceKey, Resources, TrollLocation} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {WaitButton} from "../../interface/wait-button";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {Tiles} from "../core/render/tiles";
import {FoodStorage} from "../../entities/buildings/food-storage";
import {Bed} from "../../entities/buildings/bed";
import {Pot} from "../../entities/buildings/pot";
import {Treasury} from "../../entities/buildings/treasury";

export class Lair {
    waitButton: WaitButton

    foodStorage: FoodStorage
    bed: Bed
    pot: Pot
    treasury: Treasury

    resources = {
        [ResourceKey.GOLD]: 0,
        [ResourceKey.MATERIALS]: 0
    }

    sprite: Tiles

    constructor() {
        o_.register.lair(this);
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createTiles('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.sprite.onClick(() => o_.troll.goToLair())

        this.waitButton = new WaitButton()
        this.treasury = new Treasury(positioner.getTreasuryPosition())
        this.foodStorage = new FoodStorage(positioner.getFoodStoragePosition())
        this.bed = new Bed(positioner.getBedPosition())
        this.pot = new Pot(positioner.getPotPosition());
    }

    updateMayBeMovedInto() {
        if (o_.troll.location !== TrollLocation.LAIR) this.mayBeMovedInto(true)
    }

    mayBeMovedInto(val: boolean) {
        if (val) {
            this.sprite.setInteractive(true, {cursor: 'pointer'})
        } else {
            this.sprite.setInteractive(false)
        }
    }

    mayButtonsBeClicked(val: boolean) {
        this.bed.setEnabled(val)
        this.waitButton.setEnabled(val)
        this.foodStorage.setEnabled(val)
        this.pot.setInteractive(val)
    }

    changeResource(key: ResourceKey, val: number) {
        // this.resources[key] = Math.max(this.resources[key] + val, 0)
        eventBus.emit(Evt.RESOURSES_CHANGED)
    }

    feedChar(id: string) {
        // if (this.resources.food === 0) {
        //     console.error('no food to feed', id)
        //     return;
        // }
        this.changeResource(ResourceKey.FOOD, -1);
        o_.characters.feedChar(id);
    }

    makeFoodFrom(id: string) {
        this.changeResource(ResourceKey.FOOD, 3);
        o_.characters.makeCharGiveAll(id);
        o_.characters.removeChar(id);
    }
}