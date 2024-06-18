import {ResourceKey, TrollLocation} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {O_Tiles} from "../core/render/tiles";
import {FoodStorage} from "../../entities/buildings/food-storage";
import {Bed} from "../../entities/buildings/bed/bed";
import {Pot} from "../../entities/buildings/pot";
import {Treasury} from "../../entities/buildings/treasury";
import {O_Sprite} from "../core/render/sprite";
import {Chair} from "../../entities/buildings/chair/chair";
import {CursorType} from "../core/input/cursor";
import {Tools} from "../../entities/buildings/tools/tools";

export class Lair {
    foodStorage: FoodStorage
    bed: Bed
    pot: Pot
    chair: Chair
    tools: Tools

    treasury: Treasury

    sprite: O_Tiles

    constructor() {
        o_.register.lair(this);
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createTiles('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.sprite.onClick((event) => {
            eventBus.emit(Evt.INTERFACE_LAIR_CLICKED, {event})
        })

        // this.sprite.obj.alpha = 0

        this.treasury = new Treasury(positioner.getTreasuryPosition())
        this.foodStorage = new FoodStorage(positioner.getFoodStoragePosition())
        this.bed = new Bed()
        this.pot = new Pot()
        this.chair = new Chair()
        this.tools = new Tools()
    }

    updateMayBeMovedInto() {
        throw Error("TODO phase-lair")
    }

    setInteractive = {
        all: (val: boolean) => {
            this.setInteractive.surface(val)
            this.setInteractive.bed(val)
            this.setInteractive.foodStorage(val)
            this.setInteractive.pot(val)
            this.setInteractive.chair(val)
            this.setInteractive.tools(val)
        },
        surface: (val: boolean) => this.sprite.setInteractive(val),
        bed: (val: boolean) => this.bed.setInteractive(val),
        foodStorage: (val: boolean) => this.foodStorage.setInteractive(val),
        pot: (val: boolean) => this.pot.setInteractive(val),
        chair: (val: boolean) => this.chair.setInteractive(val),
        tools: (val: boolean) => this.tools.setInteractive(val),

        surfaceOnly: () => {
            this.setInteractive.all(false)
            this.setInteractive.surface(true)
        },
    }

    /** @deprecated */
    setObjectsActive(val: boolean) {
        throw Error("use setInteractive.all")
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
}