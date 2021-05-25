import {rnd, Vec} from "../utils/utils-math";
import {O_Sprite} from "../managers/core/render/sprite";
import {o_} from "../managers/locator";
import {gameConstants} from "../constants";
import {Evt, subscriptions} from "../event-bus";
import {MeatType} from "../types";
import {positioner} from "../managers/game/positioner";
import {GameEntity, EntityType} from "../managers/core/objects";

export const enum MeatLocation {
    GROUND = 'GROUND',
    STORAGE = 'STORAGE',
    LAIR = 'LAIR',
}

export class Meat implements GameEntity<EntityType.MEAT> {
    entityType: EntityType.MEAT = EntityType.MEAT

    sprite: O_Sprite
    type: MeatType
    location: MeatLocation
    destroyed = false

    timePassed = 0

    subs = subscriptions()

    pulse: any

    constructor(pos: Vec, type: MeatType = MeatType.RAW, location: MeatLocation = MeatLocation.GROUND) {
        this.type = type;
        this.location = location;
        this.sprite = o_.render.createSprite(this.getSpriteKey(), pos.x, pos.y);
        this.sprite.onClick(() => this.onClick())
        this.setInteractive(true);

        this.pulse = o_.render.createTimeline()
        this.pulse.add({targets: this.sprite.obj, ease: 'Power2.easeInOut', yoyo: true, repeat: -1, duration: 300, scale: 1.4})

        this.subs.on(Evt.TIME_PASSED, () => this.onTimePassed());
    }

    onClick() {
        switch (this.location) {
            case MeatLocation.GROUND:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                } else {
                    this.flyTo(positioner.getRandomPlaceForMeat())
                    this.setLocation(MeatLocation.LAIR)
                }
                break;
            case MeatLocation.STORAGE:
                o_.troll.eat(this.type)
                o_.lair.foodStorage.updateFood();
                this.destroy()
                break;
            case MeatLocation.LAIR:
                if (o_.lair.foodStorage.hasFreeSpace()) {
                    o_.lair.foodStorage.placeFood(this)
                }
                break;
        }
    }

    private updateSprite() {
        this.sprite.setTexture(this.getSpriteKey())
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val, {cursor: 'pointer'})
    }

    setPulse(val: boolean) {
        if (val) this.pulse.play()
        else if (!this.pulse.paused) this.pulse.pause()
    }

    private onTimePassed() {
        this.timePassed++;
        if (this.location === MeatLocation.GROUND) {
            if (rnd() > 0.5) this.destroy()
            return
        }

        if (this.type === MeatType.RAW && this.timePassed > gameConstants.RAW_MEAT_TIME_LIMIT) {
            this.type = MeatType.STALE;
            this.updateSprite();
            this.timePassed = 0
        } else if (this.type === MeatType.STALE && this.timePassed > gameConstants.STALE_MEAT_TIME_LIMIT) {
            this.destroy()
        }
    }

    private getSpriteKey() {
        switch (this.type) {
            case MeatType.RAW:
                return 'meat_raw'
            case MeatType.STALE:
                return 'meat_stale'
            case MeatType.DRIED:
                return 'meat_dried'
        }
    }

    public setLocation(loc: MeatLocation) {
        this.location = loc;
    }

    flyTo(pos: Vec): Promise<any> {
        return o_.render.flyTo(this.sprite, pos, 1000, 500);
    }

    destroy() {
        this.destroyed = true
        this.subs.clear()
        this.sprite.destroy()
    }
}
