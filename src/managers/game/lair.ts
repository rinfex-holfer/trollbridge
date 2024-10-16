import {ResourceKey} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {O_Tiles} from "../core/render/tiles";
import {FoodStorage} from "../../entities/buildings/food-storage";
import {Bed} from "../../entities/buildings/bed";
import {Pot} from "../../entities/buildings/pot";
import {Treasury} from "../../entities/buildings/treasury";
import {Chair} from "../../entities/buildings/chair";
import {Tools} from "../../entities/buildings/tools";
import {SaveData} from "../save-manager";
import {debugExpose} from "../../utils/utils-misc";

export class Lair {
    foodStorage!: FoodStorage
    bed: Bed
    pot: Pot
    chair: Chair
    tools: Tools
    treasury: Treasury

    sprite: O_Tiles

    constructor(saveData?: SaveData) {
        o_.register.lair(this);
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createTiles('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.sprite.onClick((event) => {
            eventBus.emit(Evt.INTERFACE_LAIR_CLICKED, {event})
        })

        const children = this.initialize(saveData)
        this.bed = children.bed // only to please TS
        this.pot = children.pot
        this.chair = children.chair
        this.tools = children.tools
        this.treasury = children.treasury
        this.foodStorage = children.foodStorage

        debugExpose(() => this, 'lair')
    }

    load(saveData?: SaveData) {
        this.cleanup()
        this.initialize(saveData)
    }

    initialize(saveData?: SaveData) {
        this.treasury = new Treasury(saveData?.lair.treasury)
        this.foodStorage = new FoodStorage(saveData?.lair.foodStorage)
        this.bed = new Bed(saveData?.lair.bed)
        this.pot = new Pot(saveData?.lair.pot)
        this.chair = new Chair(saveData?.lair.chair)
        this.tools = new Tools()

        return {
            treasury: this.treasury,
            foodStorage: this.foodStorage,
            bed: this.bed,
            pot: this.pot,
            chair: this.chair,
            tools: this.tools,
        }
    }

    cleanup() {
        this.chair.destroy();
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
        allButComplexStuff: () => {
            this.setInteractive.all(true)
            this.setInteractive.tools(false)
            this.setInteractive.pot(false)
        }
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