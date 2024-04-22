import {getGameSize} from "../../utils/utils-misc";
import {o_} from "../locator";
import {rndBetween} from "../../utils/utils-math";
import {Meat} from "../../entities/meat";

//
const scenePositions = {
    bridge: {
        x: 400,
        y: 950,
        width: 1400,
        height: 400,
    },
    lairPosition: {
        x: 400,
        y: 1500,
        width: 1400,
        height: 600,
    },

}

export const positioner = {
    negotiationX() {
        const bridgePos = positioner.bridgePosition();
        return bridgePos.x + bridgePos.width * 0.7;
    },

    bridgePosition() {
        return {
            ...scenePositions.bridge
        }
    },

    getLairPosition() {
        return {
            ...scenePositions.lairPosition
        }
    },

    getLadderBottomPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width / 2,
            y: pos.y
        }
    },

    getBedPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + pos.width - 200,
            y: pos.y + pos.height - 150,
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
            x: pos.x + 170,
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
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2 + 100
        }
    }
}