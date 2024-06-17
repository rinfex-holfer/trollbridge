import {debugExpose, getGameSize} from "../../utils/utils-misc";
import {o_} from "../locator";
import {Rect, rndBetween, Vec} from "../../utils/utils-math";
import {Meat} from "../../entities/items/meat/meat";

// TODO переделать мокап, чтобы логово было глубже под мостом
const scenePositions = {
    bridge: {
        x: 400,
        y: 950,
        width: 1400,
        height: 400,
    },
    lairPosition: {
        x: 400,
        y: 1400,
        width: 1400,
        height: 500,
    },

}

export const positioner = {
    negotiationX() {
        const bridgePos = positioner.getBridgePosition();
        return bridgePos.x + bridgePos.width * 0.7;
    },

    getBridgePosition() {
        return {
            ...scenePositions.bridge
        }
    },

    getLairPosition() {
        return {
            ...scenePositions.lairPosition
        }
    },

    getLadderBounds(): [left: Rect, right: Rect] {
        const lairPos = positioner.getLairPosition();
        const width = 150
        const height = 300
        const marginFromLairTop = height / 2
        return [
            {
                x: lairPos.x + width / 2,
                y: lairPos.y - marginFromLairTop,
                width,
                height,
            },
            {
                x: lairPos.x + lairPos.width - width / 2,
                y: lairPos.y - marginFromLairTop,
                width,
                height,
            }
        ]
    },

    getBedPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width - 200,
            y: pos.y + pos.height - 150,
        }
    },

    getChairPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2 + 100,
        }
    },

    getPotPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + 180,
            y: pos.y + pos.height * 0.9
        }
    },

    getFoodStoragePosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width / 3,
            y: pos.y + pos.height * 1.5 / 4,
        }
    },

    getTreasuryPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width - 350,
            y: pos.y + 100,
        }
    },

    getRandomPlaceForMeat(meat: Meat) {
        const foodStoragePos = this.getFoodStoragePosition()
        let xRand = rndBetween(-30, 30)
        let yRand = rndBetween(-30, 30)

        if (meat.props.isStale) xRand += 150
        if (meat.props.isHuman) yRand -= 100
        return {x: foodStoragePos.x - 100 + xRand, y: foodStoragePos.y - 50 + yRand}
    },

    getPrisonerPosition() {
        const pos = positioner.getLairPosition();
        const prisonersAmount = o_.characters.getPrisoners().length
        return {
            x: pos.x + pos.width / 2 + prisonersAmount * 50,
            y: pos.y + pos.height * 0.5
        }
    },

    getBuildButtonPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x - 100,
            y: pos.y + 100
        }
    },

    getTrollLairIdlePosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width / 2 + 150,
            y: pos.y + pos.height / 2 + 100
        }
    },

    getTrollBridgePosition() {
        const bridgePos = scenePositions.bridge
        const y = bridgePos.y + bridgePos.height / 2
        const marginX = 200
        return [
            {x: bridgePos.x + marginX, y},
            {x: bridgePos.x - bridgePos.width - marginX, y}
        ]
    },
}

debugExpose(() => positioner, 'getPositioner')