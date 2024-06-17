import {BuildingEvents, BuildingEventsPayload, BuildingsPropsMap, BuildingType} from "../types";
import {ItemEventPayload, ItemEvents, ItemPropsMap} from "../../items/types";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {EffectToTypeMap, EffectType} from "../../../effects/types";
import {EntityEffect} from "../../../effects/entity-effect";
import {eventBusSubscriptions} from "../../../event-bus";
import {O_EventEmitter} from "../../../utils/utils-events";
import {o_} from "../../../managers/locator";
import {BuildingEvent, BuildingEventPayload, BuildingProps} from "./types";
import {SpriteKey} from "../../../resourse-paths";


export abstract class BaseBuilding<T extends BuildingType> {
    abstract readonly type: T

    props: BuildingsPropsMap[T] & BuildingProps

    sprite: O_Sprite

    destroyed = false

    globalEventsSubscriptions = eventBusSubscriptions()

    eventEmitter = new O_EventEmitter<BuildingEvents[T] | BuildingEvent, BuildingEventsPayload[T] & BuildingEventPayload>()

    constructor(props: BuildingsPropsMap[T] & BuildingProps) {
        this.props = props
        this.sprite = this.createSprite(props)
        this.register()
    }

    abstract createSprite(props: BuildingsPropsMap[T] & BuildingProps): O_Sprite

    private effects: Partial<Record<EffectType, EntityEffect>> = {}

    protected getEffect(type: EffectType): EffectToTypeMap[EffectType] | undefined {
        // @ts-ignore
        return this.effects[type]
    }

    protected addEffect(effect: EntityEffect) {
        this.effects[effect.type] = effect
        return effect
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val)
    }

    // register(): string {
    register() {
        // @ts-ignore
        // return o_.entities.register(this.type, this)
    }

    deregister() {
        // @ts-ignore
        // o_.entities.deregister(this)
    }
}