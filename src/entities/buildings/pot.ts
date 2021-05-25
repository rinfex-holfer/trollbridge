import {o_} from "../../managers/locator";
import {O_Sprite} from "../../managers/core/render/sprite";
import {LayerKey} from "../../managers/core/layers";
import {Vec} from "../../utils/utils-math";
import {O_AnimatedSprite} from "../../managers/core/render/animated-sprite";
import {gameConstants} from "../../constants";
import {Evt, subscriptions} from "../../event-bus";
import {MiscFood} from "../../types";

const enum PotState {
    EMPTY,
    PREPARING,
    READY
}

export class Pot {
    sprite: O_AnimatedSprite
    dishSprite: O_Sprite

    state: PotState = PotState.EMPTY

    subs = subscriptions()

    constructor(position: Vec) {
        this.sprite = o_.render.createAnimatedSprite({
            atlasKey: 'pot',
            x: position.x,
            y: position.y,
            animations:  [
                {framesPrefix: 'empty', repeat: -1, frameRate: 6},
                {framesPrefix: 'full', repeat: -1, frameRate: 6},
            ]
        })
        this.sprite.setOrigin(0.5, 1)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.setInteractive(true, {cursor: 'pointer'})
        this.sprite.onClick(() => this.onClick())

        this.dishSprite = o_.render.createSprite('dish', position.x, position.y - 40)
        o_.layers.add(this.dishSprite, LayerKey.FIELD_BUTTONS)

        this.setState(PotState.EMPTY);

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    onTimePassed() {
        if (this.state === PotState.PREPARING) {
            this.setState(PotState.READY);
        }
    }

    setState(state: PotState) {
        this.state = state;
        switch (this.state) {
            case PotState.EMPTY:
                this.sprite.play('empty')
                this.dishSprite.setVisibility(false)
                break;
            case PotState.PREPARING:
                this.sprite.play('full')
                this.dishSprite.setVisibility(false)
                break;
            case PotState.READY:
                this.sprite.play('empty')
                this.dishSprite.setVisibility(true)
                this.setInteractive(true);
                break;
        }
    }

    prepare() {
        const freshMeet = o_.lair.foodStorage.getFreshRawMeet();

        if (freshMeet.length < gameConstants.FOOD_FOR_DISH) {
            return
        }

        this.setInteractive(false)
        const promises = [] as Promise<any>[];

        freshMeet.slice(0, 3).forEach(m => {

            o_.lair.foodStorage.container.remove(m.sprite)
            m.sprite.move(o_.lair.foodStorage.container.x + m.sprite.x, o_.lair.foodStorage.container.y + m.sprite.y)
            m.setInteractive(false)
            promises.push(m.flyTo(this.sprite).then(() => {
                m.destroy()
                o_.lair.foodStorage.updateFood()
            }))
        })
        Promise.all(promises).then(() => {
            this.setState(PotState.PREPARING);
        })
    }

    eat() {
        this.setState(PotState.EMPTY)
        o_.troll.eat(MiscFood.DISH)
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        switch (this.state) {
            case PotState.EMPTY:
                this.prepare()
                break;
            case PotState.PREPARING:
                break;
            case PotState.READY:
                this.eat()
                break;
        }
    }
}