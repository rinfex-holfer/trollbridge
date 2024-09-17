import {rnd, rnd2, rndBetween, Vec} from "../../../utils/utils-math";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {o_} from "../../../managers/locator";
import {Evt} from "../../../event-bus";
import {positioner} from "../../../managers/game/positioner";
import {LayerKey} from "../../../managers/core/layers";
import {SOUND_KEY} from "../../../managers/core/audio";
import {ImageKey} from "../../../utils/utils-types";
import {FoodType} from "../../../types";
import {foodConfig} from "../../../configs/food-config";
import {destroyInteractiveObjWithFade, destroyInteractiveObjWithJump} from "../../../helpers";
import {debugExpose} from "../../../utils/utils-misc";
import {EffectRotten} from "../../../effects/rotten";
import {EffectType} from "../../../effects/types";
import {BaseItem} from "../base-item/base-item";
import {ItemType} from "../types";
import {MeatEvent} from "./meat-events";
import {EffectHighlight} from "../../../effects/highlight";

export const enum MeatLocation {
    GROUND = 'GROUND',
    STORAGE = 'STORAGE',
    LAIR = 'LAIR',
}

export const meatSprite = {
    ANIMAL: 'meat_raw' as ImageKey,
    HUMAN_HAND: 'meat_human_hand' as ImageKey,
    HUMAN_LEG: 'meat_human_leg' as ImageKey,
}

export const MEAT_WIDTH = 50;

export interface MeatData {
    isHuman: boolean,
    isStale: boolean,
    position: Vec,
    timePassed: number,
    location: MeatLocation
}

export class Meat extends BaseItem<ItemType.MEAT> {
    type: ItemType.MEAT = ItemType.MEAT
    id: string

    sprite: O_Sprite

    jumpTween: Phaser.Tweens.Tween

    data: MeatData = {
        isHuman: false,
        isStale: false,
        position: {x: 0, y: 0},
        location: MeatLocation.GROUND,
        timePassed: 0
    }

    constructor(data: Partial<MeatData>, key: ImageKey = meatSprite.ANIMAL) {
        super()
        this.id = this.register()

        this.data = {
            ...this.data,
            ...data
        }

        this.sprite = o_.render.createSprite(key, this.data.position.x, this.data.position.y)
        this.sprite.setWidth(MEAT_WIDTH)
        this.sprite.setOrigin(0.5, 0.5)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
        this.sprite.onClick(() => {
            if (this.onClick) return this.onClick()
            else this.onClickDefault()
        })
        this.sprite.onRightClick(() => {
            this.onRightClick()
        })

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )

        this.data.position = this.updateRealPosition()

        // this shit still ruins y coord in flyTo method somehow
        this.jumpTween = o_.render.createJumpingTween(this.sprite)

        if (this.data.isStale) {
            this.addEffect(new EffectRotten(this))
        }

        this.globalEventsSubscripions.on(Evt.TIME_PASSED, () => this.onTimePassed())
    }

    private onClickDefault() {
        this.bePlaced()
    }

    private onRightClick() {
        this.eat()
    }

    private flyOnLairGround() {
        this.flyTo(positioner.getRandomPlaceForMeat(this)).then(() => {
            o_.audio.playSound(SOUND_KEY.BONK);
            this.updateRealPosition()
        })
        this.setLocation(MeatLocation.LAIR)
        o_.lair.foodStorage.updateFood()
    }

    public bePlaced() {
        switch (this.data.location) {
            case MeatLocation.GROUND:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.flyOnLairGround()
                }
                break;
            case MeatLocation.STORAGE:
                this.flyOnLairGround()
                break;
            case MeatLocation.LAIR:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    if (this.isBouncing) return;
                    this.isBouncing = true
                    o_.render.bounceOfGround(this.sprite, 20, 500).then(() => {
                        this.isBouncing = false
                    })
                }
                break;
        }
    }

    isBouncing = false

    eat() {
        o_.troll.eat(FoodType.MEAT, this.data.isStale, this.data.isHuman)
        o_.lair.foodStorage.updateFood();
        this.destroy()
    }

    private onClick: (() => void) | undefined

    setJumping(val: boolean) {
        if (val) {
            this.jumpTween.play()
        } else {
            this.jumpTween.stop()
            this.jumpTween.destroy()
            this.jumpTween = o_.render.createJumpingTween(this.sprite)
            this.sprite.move(this.data.position.x, this.data.position.y)
        }
    }

    becomeRotten() {
        this.eventEmitter.emit(MeatEvent.WENT_STALE)
        this.addEffect(new EffectRotten(this))
        this.data.isStale = true
        this.data.timePassed = 0
    }

    private onTimePassed() {
        this.data.timePassed++;
        if (this.data.location !== MeatLocation.STORAGE) {
            this.data.timePassed += 2;
            if (rnd() > 0.9) {
                return destroyInteractiveObjWithFade(this)
            }
        }

        if (!this.data.isStale && this.data.timePassed > foodConfig.RAW_MEAT_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.data.isStale && this.data.timePassed > foodConfig.STALE_MEAT_TIME_LIMIT) {
            destroyInteractiveObjWithFade(this)
        }
    }

    updateRealPosition() {
        this.data.position = {x: this.sprite.x, y: this.sprite.y}
        return this.data.position
    }

    setOnClick(callback: undefined | ((meat: Meat) => void)) {
        this.onClick = !callback ? undefined : () => callback(this)
    }

    moveToPreparationPlace(coord: Vec) {
        this.setJumping(false)
        if (this.data.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.remove(this.sprite)

        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)
        this.sprite.move(coord.x, coord.y)
    }

    moveBackToPlaceFromWhereItWasChosen() {
        if (this.data.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.add(this.sprite)
        this.sprite.move(this.data.position.x, this.data.position.y)
        o_.layers.add(this.sprite, LayerKey.FIELD_OBJECTS)
    }

    onLastAnimation() {
        this.setJumping(false)
        this.setInteractive(false)
        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)
    }

    public setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
    }

    public setLocation(loc: MeatLocation) {
        this.data.location = loc;
    }

    public flyTo(pos: Vec, speed = 1000, maxDuration = 500): Promise<any> {
        this.setJumping(false);

        const effectRotten = this.getEffect(EffectType.ROTTEN)
        if (this.data.isStale && !!effectRotten) effectRotten.stopGas()
        if (this.data.location === MeatLocation.STORAGE && this.sprite.obj.parentContainer === o_.lair.foodStorage.container.obj) {
            o_.lair.foodStorage.container.remove(this.sprite)
            this.sprite.x += o_.lair.foodStorage.container.x
            this.sprite.y += o_.lair.foodStorage.container.y
        }

        console.log("flyTo 1")
        return o_.render.flyTo(this.sprite, pos, speed, maxDuration).then(() => {
            console.log("flyTo then")
            // console.log("finish", this)
            // this.updateEmitters()
            if (this.data.isStale && !!effectRotten) effectRotten.startGas()
        });
    }

    public throwTo(pos: Vec) {
        const oldInteractive = this.sprite.isInteractive
        this.setInteractive(false)
        o_.render.thrownTo(this.sprite, pos, 700).then(() => this.setInteractive(oldInteractive))
    }


    onDestroyed() {
        o_.lair.foodStorage.updateFood()
    }
}

debugExpose((amount = 1) => {
    for (let i = 0; i < amount; i++) {
        const x = rndBetween(600, 700)
        const y = rndBetween(1100, 1300)
        const meat = new Meat({
            position: {x, y},
            location: MeatLocation.GROUND,
            isHuman: true,
        }, rnd2(meatSprite.HUMAN_LEG, meatSprite.HUMAN_HAND))
        console.log(meat)
        return meat
    }
}, 'spawnHumanMeat')

debugExpose((amount = 1) => {
    for (let i = 0; i < amount; i++) {
        const x = rndBetween(600, 700)
        const y = rndBetween(1100, 1300)
        const meat = new Meat({
            position: {x, y},
            location: MeatLocation.GROUND,
            isHuman: false,
        })
        console.log(meat)
        return meat
    }
}, 'spawnMeat')
