import {O_Sprite} from "../../../managers/core/render/sprite";
import {EffectToTypeMap, EffectType} from "../../../effects/types";
import {EntityEffect} from "../../../effects/entity-effect";
import {eventBusSubscriptions} from "../../../event-bus";
import {O_EventEmitter} from "../../../utils/utils-events";
import {o_} from "../../../managers/locator";
import {Item, ItemEventPayload, ItemEvents, ItemDataMap, ItemType} from "../types";
import {BaseItemEvent, BaseItemEventPayload} from "./types";
import {EffectHighlight} from "../../../effects/highlight";

export abstract class BaseItem<T extends ItemType> implements Item<T> {
    abstract type: T
    abstract id: string

    abstract data: ItemDataMap[T]

    public getData = () => {
        return {
            ...this.data
        }
    }

    sprite?: O_Sprite

    private effects: Partial<Record<EffectType, EntityEffect>> = {}

    destroyed = false

    globalEventsSubscripions = eventBusSubscriptions()

    eventEmitter = new O_EventEmitter<ItemEvents[T] | BaseItemEvent, ItemEventPayload[T] & BaseItemEventPayload>()

    register(): string {
        // @ts-ignore
        return o_.items.register(this.type, this)
    }

    deregister() {
        // @ts-ignore
        o_.items.deregister(this)
    }

    public updateInteractive() {
    }

    public setInteractive(val: boolean) {
    }

    protected getEffect<T extends EffectType>(type: T): EffectToTypeMap[T] | undefined {
        // @ts-ignore
        return this.effects[type]
    }

    protected addEffect(effect: EntityEffect) {
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

