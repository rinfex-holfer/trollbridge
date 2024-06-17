import {o_} from "../../../managers/locator";
import {O_Sprite} from "../../../managers/core/render/sprite";
import {LayerKey} from "../../../managers/core/layers";
import {Vec} from "../../../utils/utils-math";
import {eventBus, Evt} from "../../../event-bus";
import {CursorType} from "../../../managers/core/input/cursor";
import {BasicBuilding} from "../basic-building/basic-building";
import {BuildingsPropsMap, BuildingType} from "../types";
import {BedProps} from "./types";
import {positioner} from "../../../managers/game/positioner";
import {ChairProps} from "../chair/types";
import {MakeOptional} from "../../../utils/utils-types";
import {BuildingProps} from "../basic-building/types";
import {createId} from "../../../utils/utils-misc";
import {EffectHighlight} from "../../../effects/highlight";
import {EffectType} from "../../../effects/types";

const defaultProps: BedProps = {
    level: 1
}

type Props = BedProps & MakeOptional<BuildingProps, "id">

export class Bed extends BasicBuilding<BuildingType.BED> {
    type = BuildingType.BED as BuildingType.BED

    upgraded = false

    constructor(props: Props) {
        super({
            ...defaultProps,
            id: props?.id || createId('bed'),
            ...props
        })

        o_.upgrade.createUpgradeButton({x: this.sprite.x, y: this.sprite.y}, 'кровать', 50, () => this.upgrade())

        this.addEffect(new EffectHighlight(this)) as EffectHighlight
        this.sprite.onHover(
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(true),
            () => this.getEffect(EffectType.HIGHLIGHTED)?.setActive(false)
        )
    }

    createSprite(props: Props): O_Sprite {
        const position = positioner.getBedPosition()
        const spriteKey = this.upgraded ? 'bed_upgraded' : 'bed'

        const sprite = o_.render.createSprite(spriteKey, position.x, position.y)
        // sprite.setOrigin(0, 0)
        // o_.layers.add(sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true, {cursor: CursorType.POINTER})
        sprite.setWidth(200, false)
        sprite.setHeight(100, false)
        sprite.onClick(() => this.onClick())

        return sprite
    }

    upgrade() {
        this.sprite.setTexture('bed_upgraded')
        this.upgraded = true
    }

    setInteractive(val: boolean) {
        this.sprite.setInteractive(val);
    }

    onClick() {
        eventBus.emit(Evt.INTERFACE_BED_CLICKED)
    }
}