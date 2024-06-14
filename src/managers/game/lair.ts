import {ResourceKey, TrollLocation} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {O_Tiles} from "../core/render/tiles";
import {FoodStorage} from "../../entities/buildings/food-storage";
import {Bed} from "../../entities/buildings/bed";
import {Pot} from "../../entities/buildings/pot";
import {Treasury} from "../../entities/buildings/treasury";
import {LairMenu} from "../../interface/lair-menu";
import {O_Sprite} from "../core/render/sprite";

export class Lair {
    foodStorage: FoodStorage
    bed: Bed
    pot: Pot
    treasury: Treasury

    sprite: O_Tiles

    leftPart: O_Sprite
    rightPart: O_Sprite

    menu: LairMenu

    constructor() {
        o_.register.lair(this);
        const pos = positioner.getLairPosition();
        this.sprite = o_.render.createTiles('grass', pos.x, pos.y, pos.width, pos.height);
        this.sprite.setOrigin(0, 0);

        this.leftPart = o_.render.createSprite('empty_sprite', pos.x, pos.y, {
            width: pos.width / 2,
            height: pos.height
        });
        this.leftPart.setOrigin(0, 0);

        this.rightPart = o_.render.createSprite('empty_sprite', pos.x + pos.width / 2, pos.y, {
            width: pos.width / 2,
            height: pos.height
        });
        this.rightPart.setOrigin(0, 0);

        this.leftPart.onClick(() => {
            eventBus.emit(Evt.INTERFACE_LAIR_CLICKED, "left")
        })
        this.rightPart.onClick(() => {
            eventBus.emit(Evt.INTERFACE_LAIR_CLICKED, "right")
        })

        // this.sprite.obj.alpha = 0

        this.treasury = new Treasury(positioner.getTreasuryPosition())
        this.foodStorage = new FoodStorage(positioner.getFoodStoragePosition())
        this.bed = new Bed(positioner.getBedPosition())
        this.pot = new Pot();

        this.menu = new LairMenu()
    }

    updateMayBeMovedInto() {
        throw Error("TODO phase-lair")
    }

    setClickable(val: boolean) {
        if (val) {
            this.leftPart.setInteractive(true, {cursor: 'pointer'})
            this.rightPart.setInteractive(true, {cursor: 'pointer'})
        } else {
            this.leftPart.setInteractive(false)
            this.rightPart.setInteractive(false)
        }
    }

    setObjectsActive(val: boolean) {
        this.bed.setEnabled(val)
        this.foodStorage.setEnabled(val)
        this.pot.setInteractive(val)
    }

    setMenuShown(val: boolean) {
        if (val) {
            this.menu.show()
        } else {
            this.menu.hide()
        }
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