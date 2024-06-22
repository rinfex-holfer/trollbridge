import {BuildingProps} from "../basic-building/types";
import {BasicBuilding} from "../basic-building/basic-building";
import {BuildingsPropsMap, BuildingType} from "../types";
import {createId} from "../../../utils/utils-misc";
import {o_} from "../../../managers/locator";
import {EffectHighlight} from "../../../effects/highlight";
import {EffectType} from "../../../effects/types";
import {ToolsProps} from "./types";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {positioner} from "../../../managers/game/positioner";
import {CursorType} from "../../../managers/core/input/cursor";
import {eventBus, Evt} from "../../../event-bus";

const defaultProps: ToolsProps = {}

export class Tools extends BasicBuilding<BuildingType.TOOLS> {
    type = BuildingType.TOOLS as BuildingType.TOOLS

    upgraded = false

    constructor(props?: Partial<ToolsProps & BuildingProps>) {
        super({
            ...defaultProps,
            id: props?.id || createId('tools'),
            ...props
        })

        this.addEffect(new EffectHighlight(this.sprite)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )
    }

    createSprite(props: BuildingsPropsMap[BuildingType.TOOLS] & BuildingProps): O_Sprite {
        const position = positioner.getToolsPosition()
        const spriteKey = 'tools'
        const sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // sprite.setOrigin(0, 0)
        // o_.layers.add(sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true)
        sprite.setWidth(100)
        sprite.onClick(() => this.onClick())

        return sprite
    }

    setInteractive(val: boolean) {
        super.setInteractive(val);
        if (val === false) {
            this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
            o_.input.setDefaultCursor()
        }
    }

    onClick = () => {
        eventBus.emit(Evt.INTERFACE_TOOLS_CLICKED)
    }
}