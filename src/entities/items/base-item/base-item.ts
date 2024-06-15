import {O_Sprite} from "../../../managers/core/render/sprite";
import {EffectToTypeMap, EffectType} from "../../../effects/types";
import {EnityEffect} from "../../../effects/entity-effect";
import {eventBusSubscriptions} from "../../../event-bus";
import {O_EventEmitter} from "../../../utils/utils-events";
import {o_} from "../../../managers/locator";
import {Item, ItemEventPayload, ItemEvents, ItemPropsMap, ItemType} from "../types";
import {BaseItemEvent, BaseItemEventPayload} from "./types";

export abstract class BaseItem<T extends ItemType> implements Item<T> {
    abstract type: T
    abstract id: string

    abstract props: ItemPropsMap[T]

    sprite?: O_Sprite

    private effects: Partial<Record<EffectType, EnityEffect>> = {}

    destroyed = false

    globalEventsSubscripions = eventBusSubscriptions()

    eventEmitter = new O_EventEmitter<ItemEvents[T] | BaseItemEvent, ItemEventPayload[T] & BaseItemEventPayload>()

    register(): string {
        // @ts-ignore
        return o_.entities.register(this.type, this)
    }

    deregister() {
        // @ts-ignore
        o_.entities.deregister(this)
    }

    public updateInteractive() {
    }

    public setInteractive(val: boolean) {
    }

    protected getEffect(type: EffectType): EffectToTypeMap[EffectType] | undefined {
        // @ts-ignore
        return this.effects[type]
    }

    protected addEffect(effect: EnityEffect) {
        this.effects[effect.type] = effect
        return effect
    }

    private _destroy = () => {
        if (this.destroyed) {
            return
        }
        this.deregister()
        this.destroyed = true
        this.globalEventsSubscripions.clear()
        Object.values(this.effects).forEach(effect => effect.destroy())

        if (this.sprite) {
            this.sprite.destroy()
        }

        this.onDestroyed()

        this.eventEmitter.emit(BaseItemEvent.DESTROYED)
    }
    get destroy() {
        return this._destroy
    }

    protected abstract onDestroyed(): void
}

