import {eventBusSubscriptions} from "../../event-bus";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Meat, MEAT_WIDTH, MeatLocation} from "../items/meat/meat";
import {O_Container} from "../../managers/core/render/container";
import {O_Sprite} from "../../managers/core/render/sprite";
import {SOUND_KEY} from "../../managers/core/audio";
import {createId} from "../../utils/utils-misc";
import {goldConfig} from "../../configs/gold-config";
import {createUpgradableComponent, UpgradableComponent, UpgradableComponentData} from "../../components/upgradable";
import {positioner} from "../../managers/game/positioner";

import {Txt} from "../../translations";
import {EffectType} from "../../effects/types";
import {ChairData} from "./chair";

const START_X = 60
const START_Y = -70
const MARGIN_X = MEAT_WIDTH
const MARGIN_Y = 40
const RACK_WIDTH = 250

export type FoodStorageData = {
    id?: string,
    cmp?: {
        upgradable?: UpgradableComponentData
    }
}

type FoodPlace = [Vec, Meat | null]

export class FoodStorage {
    id: string

    cmp: {
        upgradable: UpgradableComponent
    }

    position: Vec = {x: 0, y: 0}

    sprite1?: O_Sprite
    sprite2?: O_Sprite

    container: O_Container;

    subscriptions = eventBusSubscriptions()

    places: FoodPlace[] = []

    constructor(props?: FoodStorageData) {
        this.id = createId('food_storage')
        this.position = positioner.getFoodStoragePosition()

        this.container = o_.render.createContainer(this.position.x, this.position.y)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)

        const level = props?.cmp?.upgradable?.level || 0
        this.cmp = {
            upgradable: createUpgradableComponent(this, {
                buttonCoord: {
                    x: this.container.x + 30,
                    y: this.container.y - 30
                },
                ...this.getTextKeys(),
                getUpgradeCost: this.getUpgradeCost,
                canBeUpgraded: this._canBeUpgraded,
                upgrade: this._upgrade,
                level,
                ...props?.cmp?.upgradable,
            })
        }

        this.cmp.upgradable.init()

        this.updateSprites()
    }

    getTextKeys = () => {
        return {
            titleTextKey: () => {
                if (this.cmp.upgradable.level === 0) return Txt.BuildDryingRackTitle
                return Txt.UpgradeDryingRackTitle
            },
            descriptionTextKey: () => {
                if (this.cmp.upgradable.level === 0) return Txt.BuildDryingRackText
                return Txt.UpgradeDryingRackText
            },
        }
    }

    private _canBeUpgraded = () => this.cmp.upgradable.level < 2

    updateSprites() {
        if (this.cmp.upgradable.level === 0) {
            return
        }

        if (this.cmp.upgradable.level >= 1 && !this.sprite1) {
            const sprite = o_.render.createSprite('drying_rack', 0, 0, {parent: this.container})
            sprite.setOrigin(0, 1)
            sprite.setWidth(RACK_WIDTH)
            this.sprite1 = sprite
        }

        if (this.cmp.upgradable.level === 2) {
            if (!!this.sprite2) return

            if (!this.sprite1) {
                throw Error('cant upgrade food storage to level 2 without sprite from level 1')
            }

            const sprite2 = o_.render.createSprite('drying_rack', this.sprite1.width - 30, 0, {parent: this.container})
            sprite2.setOrigin(0, 1)
            sprite2.setWidth(RACK_WIDTH)
            this.sprite2 = sprite2
        }
    }

    _upgrade = () => {
        if (!this._canBeUpgraded()) {
            throw Error("food storage cant be upgraded")
        }

        this.cmp.upgradable.level++

        this.updateSprites()

        const oldFood = [...this.places]

        this.places = this.getPlacesForFood()
        oldFood.forEach((oldPlace, idx) => {
            if (!!oldPlace[1]) {
                this.places[idx][1] = oldPlace[1]
            }
        })
    }

    getPlacesForFood = (): FoodPlace[] => {
        const firstSection: FoodPlace[] = [
            [{x: START_X, y: START_Y}, null],
            [{x: START_X + MARGIN_X, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 2, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 3, y: START_Y}, null],
        ];
        const secondSection: FoodPlace[] = [
            [{x: START_X + MARGIN_X * 6, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 7, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 8, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 9, y: START_Y}, null]
        ]
        if (this.cmp.upgradable.level === 0) {
            return []
        } else if (this.cmp.upgradable.level === 1) {
            return [
                ...firstSection,
            ]
        } else if (this.cmp.upgradable.level === 2) {
            return [
                ...firstSection,
                ...secondSection,
            ]
        }

        throw Error('incorrect level of food storage ' + this.cmp.upgradable.level)
    }

    getData(): FoodStorageData {
        return {
            id: this.id,
            cmp: {
                upgradable: this.cmp.upgradable.getData()
            }
        }
    }

    getUpgradeCost = () => {
        return goldConfig.costs.drying_rack[this.cmp.upgradable.level]
    }

    placeFood(food: Meat) {
        const place = this.getNextPlace();
        if (!place) return;

        const coord = place[0];

        o_.audio.playSound(SOUND_KEY.PICK)
        place[1] = food
        food.setLocation(MeatLocation.STORAGE)
        food.flyTo({x: this.container.x + coord.x, y: this.container.y + coord.y})
            .then(() => {
                this.container.add(food.sprite)
                food.sprite.move(coord.x, coord.y)
                food.updateRealPosition()
                o_.audio.playSound(SOUND_KEY.PICK_BIG)
            })
    }

    hasFreeSpace() {
        return !!this.getNextPlace()
    }

    getNextPlace() {
        return this.places.find(p => p[1] === null)
    }

    destroy() {
        this.subscriptions.clear();
        this.sprite1?.destroy()
        this.sprite2?.destroy()
        this.container.destroy()
    }

    updateFood() {
        this.places.forEach(p => {
            if (p[1]?.destroyed === true || p[1]?.location !== MeatLocation.STORAGE) {
                p[1] = null;
            }
        })
    }

    setInteractive(val: boolean) {
        this.places.forEach(p => p[1]?.setInteractive(val))
    }
}