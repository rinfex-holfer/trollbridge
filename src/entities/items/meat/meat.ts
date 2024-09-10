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

export class Meat extends BaseItem<ItemType.MEAT> {
    type: ItemType.MEAT = ItemType.MEAT
    id: string

    sprite: O_Sprite
    location: MeatLocation

    timePassed = 0

    jumpTween: Phaser.Tweens.Tween
    jumpTweenDirty = false

    realPosition: Vec

    data = {
        isHuman: false,
        isStale: false,
    }

    constructor(pos: Vec, location: MeatLocation = MeatLocation.GROUND, isHuman = false, key: ImageKey = meatSprite.ANIMAL) {
        super()
        this.id = this.register()

        this.location = location;
        this.data.isHuman = isHuman

        this.sprite = o_.render.createSprite(key, pos.x, pos.y)
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

        this.realPosition = this.updateRealPosition()

        // this shit still ruins y coord in flyTo method somehow
        this.jumpTween = o_.render.createJumpingTween(this.sprite)

        this.globalEventsSubscripions.on(Evt.TIME_PASSED, () => this.onTimePassed())

        this.globalEventsSubscripions.on(Evt.ENCOUNTER_STARTED, () => this.updateInteractive())
        this.globalEventsSubscripions.on(Evt.ENCOUNTER_ENDED, () => this.updateInteractive())

        this.updateInteractive()
    }

    private onClickDefault() {
        this.bePlacedOrBeEaten()
    }

    private onRightClick() {
        if (this.location === MeatLocation.STORAGE) {
            this.flyOnLairGround()
        } else {
            destroyInteractiveObjWithJump(this)
        }
    }

    private flyOnLairGround() {
        this.flyTo(positioner.getRandomPlaceForMeat(this)).then(() => {
            o_.audio.playSound(SOUND_KEY.BONK);
            this.updateRealPosition()
        })
        this.setLocation(MeatLocation.LAIR)
        o_.lair.foodStorage.updateFood()
    }

    public bePlacedOrBeEaten() {
        switch (this.location) {
            case MeatLocation.GROUND:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.flyOnLairGround()
                }
                break;
            case MeatLocation.STORAGE:
                this.eat()
                break;
            case MeatLocation.LAIR:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.eat()
                }
                break;
        }
    }

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
            this.sprite.move(this.realPosition.x, this.realPosition.y)
        }
    }

    becomeRotten() {
        this.eventEmitter.emit(MeatEvent.WENT_STALE)
        this.addEffect(new EffectRotten(this))
        this.data.isStale = true
        this.timePassed = 0
    }

    private onTimePassed() {
        this.timePassed++;
        if (this.location !== MeatLocation.STORAGE) {
            this.timePassed += 2;
            if (rnd() > 0.9) {
                return destroyInteractiveObjWithFade(this)
            }
        }

        if (!this.data.isStale && this.timePassed > foodConfig.RAW_MEAT_TIME_LIMIT) {
            this.becomeRotten()
        } else if (this.data.isStale && this.timePassed > foodConfig.STALE_MEAT_TIME_LIMIT) {
            destroyInteractiveObjWithFade(this)
        }
    }

    updateRealPosition() {
        this.realPosition = {x: this.sprite.x, y: this.sprite.y}
        return this.realPosition
    }

    setOnClick(callback: undefined | ((meat: Meat) => void)) {
        this.onClick = !callback ? undefined : () => callback(this)
    }

    moveToPreparationPlace(coord: Vec) {
        this.setJumping(false)
        if (this.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.remove(this.sprite)

        o_.layers.add(this.sprite, LayerKey.FIELD_BUTTONS)
        this.sprite.move(coord.x, coord.y)
    }

    moveBackToPlaceFromWhereItWasChosen() {
        if (this.location === MeatLocation.STORAGE) o_.lair.foodStorage.container.add(this.sprite)
        this.sprite.move(this.realPosition.x, this.realPosition.y)
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

    public updateInteractive() {
        this.setInteractive(
            !o_.battle.isBattle &&
            !o_.negotiations.getIsNegotiationsInProgress()
        )
    }

    public setLocation(loc: MeatLocation) {
        this.location = loc;
    }

    public flyTo(pos: Vec, speed = 1000, maxDuration = 500): Promise<any> {
        console.log("flyTo 0")
        this.setJumping(false);

        const effectRotten = this.getEffect(EffectType.ROTTEN)
        if (this.data.isStale && !!effectRotten) effectRotten.stopGas()
        if (this.location === MeatLocation.STORAGE && this.sprite.obj.parentContainer === o_.lair.foodStorage.container.obj) {
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
        this.setInteractive(false)
        o_.render.thrownTo(this.sprite, pos, 700).then(() => this.updateInteractive())
    }


    onDestroyed() {
        o_.lair.foodStorage.updateFood()
    }
}

debugExpose((amount = 1) => {
    for (let i = 0; i < amount; i++) {
        const x = rndBetween(600, 700)
        const y = rndBetween(1100, 1300)
        const meat = new Meat({x, y}, MeatLocation.GROUND, true, rnd2(meatSprite.HUMAN_LEG, meatSprite.HUMAN_HAND))
        console.log(meat)
        return meat
    }
}, 'spawnHumanMeat')

debugExpose((amount = 1) => {
    for (let i = 0; i < amount; i++) {
        const x = rndBetween(600, 700)
        const y = rndBetween(1100, 1300)
        const meat = new Meat({x, y}, MeatLocation.GROUND, false)
        console.log(meat)
        return meat
    }
}, 'spawnMeat')
