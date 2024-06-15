import {o_} from "../../../managers/locator";
import {LayerKey} from "../../../managers/core/layers";
import {eventBus, Evt} from "../../../event-bus";
import {SpriteKey} from "../../../resourse-paths";
import {BaseBuilding} from "../base-building/base-building";
import {BuildingType} from "../types";
import {BuildingProps} from "../base-building/types";
import {ChairProps} from "./types";
import {MakeOptional} from "../../../utils/utils-types";
import {createId} from "../../../utils/utils-misc";
import {o_logger} from "../../../utils/logger";
import {Txt} from "../../../managers/core/texts";
import {positioner} from "../../../managers/game/positioner";

const defaultProps: ChairProps = {
    level: 1
}

type Props = ChairProps & MakeOptional<BuildingProps, "id">

const CHAIR_WIDTH = 100

export class Chair extends BaseBuilding<BuildingType.CHAIR> {
    type = BuildingType.CHAIR as BuildingType.CHAIR

    constructor(props?: Props) {
        super({
            ...defaultProps,
            id: props?.id || createId('chair'),
            ...props
        })

        o_.upgrade.createUpgradeButton(
            {x: this.sprite.x, y: this.sprite.y},
            o_.texts.t(Txt.UpgradeChair),
            50,
            this.upgrade,
            this.getIsMaxLevel
        )
    }

    createSprite(props: Props) {
        const position = positioner.getChairPosition()
        const sprite = o_.render.createSprite(this.getSpriteKey(), position.x, position.y)
        // o_.layers.add(this.sprite, LayerKey.BACKGROUND)
        sprite.setInteractive(true, {cursor: 'pointer'})
        sprite.setWidth(CHAIR_WIDTH)
        sprite.setOrigin(0.5, 1)

        sprite.onClick(() => this.onClick())

        return sprite
    }

    private getSpriteKey(): SpriteKey {
        switch (this.props.level) {
            case 1:
                return 'chair_0'
            case 2:
                return 'chair_1'
            case 3:
                return 'chair_2'
            case 4:
                return 'chair_3'
        }
    }

    upgrade = () => {
        if (this.getIsMaxLevel()) {
            o_logger.error("can't be upgraded, already max level")
            return;
        }
        this.props.level++
        this.sprite.setTexture(this.getSpriteKey())
        this.sprite.setWidth(CHAIR_WIDTH)
    }

    getIsMaxLevel = () => this.props.level >= 4

    onClick() {
        eventBus.emit(Evt.INTERFACE_CHAIR_CLICKED)
    }
}