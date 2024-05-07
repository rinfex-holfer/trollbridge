import {subscriptions} from "../../event-bus";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {Meat, MEAT_WIDTH, MeatLocation} from "../meat";
import {O_Container} from "../../managers/core/render/container";
import {O_Sprite} from "../../managers/core/render/sprite";
import {SOUND_KEY} from "../../managers/core/audio";
import {dumbClone} from "../../utils/utils-misc";
import {gameConstants} from "../../configs/constants";
import {goldConfig} from "../../configs/gold-config";

const START_X = 60
const START_Y = -70
const MARGIN_X = MEAT_WIDTH
const MARGIN_Y = 40
const RACK_WIDTH = 250

export class FoodStorage {
    position: Vec = {x: 0, y: 0}

    sprite: O_Sprite
    container: O_Container;

    subscriptions = subscriptions()

    upgraded = false

    places: [Vec, Meat | null][] = [
        [{x: START_X, y: START_Y}, null],
        [{x: START_X + MARGIN_X, y: START_Y}, null],
        [{x: START_X + MARGIN_X * 2, y: START_Y}, null],
        [{x: START_X + MARGIN_X * 3, y: START_Y}, null],
    ]

    constructor(pos: Vec) {
        this.position = pos

        this.container = o_.render.createContainer(pos.x, pos.y)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)

        this.sprite = o_.render.createSprite('drying_rack', 0, 0, {parent: this.container})
        this.sprite.setOrigin(0, 1)
        this.sprite.setWidth(RACK_WIDTH)

        if (this.upgraded) {
            this.upgrade()
        } else {
            o_.upgrade.createUpgradeButton(
                {x: this.container.x + this.sprite.width + 30, y: this.container.y - this.sprite.height / 2},
                'вторая сушилка для мяса',
                goldConfig.costs.drying_rack,
                () => this.upgrade()
            )
        }

        // console.log(this);
    }

    upgrade() {
        if (this.upgraded) return;
        const sprite2 = o_.render.createSprite('drying_rack', this.sprite.width - 30, 0, {parent: this.container})
        sprite2.setOrigin(0, 1)
        sprite2.setWidth(RACK_WIDTH)
        this.places = this.places.concat([
            // [{x: START_X + MARGIN_X * 4, y: START_Y}, null],
            // [{x: START_X + MARGIN_X * 5, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 6, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 7, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 8, y: START_Y}, null],
            [{x: START_X + MARGIN_X * 9, y: START_Y}, null],])
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
    }

    updateFood() {
        this.places.forEach(p => {
            if (p[1]?.destroyed === true || p[1]?.location !== MeatLocation.STORAGE) {
                p[1] = null;
            }
        })
    }

    setEnabled(val: boolean) {
        this.places.forEach(p => p[1]?.setInteractive(val))
    }
}