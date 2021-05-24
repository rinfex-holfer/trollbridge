import {Evt, subscriptions} from "../../event-bus";
import {Vec} from "../../utils/utils-math";
import {o_} from "../../managers/locator";
import {LayerKey} from "../../managers/core/layers";
import {O_Container} from "../../managers/core/render/container";
import {Meat, MeatLocation} from "../meat";
import {MeatType} from "../../types";

const MARGIN_X = 20
const MARGIN_Y = 40

export class FoodStorage {
    position: Vec = {x: 0, y: 0}

    container: O_Container;

    subscriptions = subscriptions()

    places: [Vec, Meat | null][] = [
        [{x: 0, y: 0}, null],           [{x: MARGIN_X, y: 0}, null],        [{x: MARGIN_X * 2, y: 0}, null],            [{x: MARGIN_X * 3, y: 0}, null],            [{x: MARGIN_X * 4, y: 0}, null],
        [{x: 0, y: MARGIN_Y}, null],    [{x: MARGIN_X, y: MARGIN_Y}, null], [{x: MARGIN_X * 2, y: MARGIN_Y}, null],     [{x: MARGIN_X * 3, y: MARGIN_Y}, null],     [{x: MARGIN_X * 4, y: MARGIN_Y}, null]
    ]

    constructor(pos: Vec) {
        this.position = pos;

        this.container =  o_.render.createContainer(pos.x, pos.y)
        o_.layers.add(this.container, LayerKey.FIELD_OBJECTS)
    }

    getFreshRawMeet(): Meat[] {
        // @ts-ignore
        return this.places.filter(p => p[1]?.type === MeatType.RAW).map(p => p[1])
    }

    freshFoodAmount() {
        return this.places.filter(p => p[1]?.type !== MeatType.STALE).length
    }

    placeFood(food: Meat) {
        const place = this.getNextPlace();
        console.log('getFood', place)
        if (!place) return;

        const coord = place[0];

        place[1] = food
        food.flyTo({x: this.container.x + coord.x, y: this.container.y + coord.y})
            .then(() => {
                this.container.add(food.sprite);
                food.sprite.move(coord.x, coord.y)
                food.setLocation(MeatLocation.STORAGE)
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
            if (p[1]?.destroyed === true) {
                p[1] = null;
            }
        })
    }

    setEnabled(val: boolean) {
        this.places.forEach(p => p[1]?.setInteractive(val))
    }
}