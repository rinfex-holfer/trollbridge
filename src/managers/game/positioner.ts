import {getGameSize} from "../../utils/utils-misc";
import {o_} from "../locator";
import {rndBetween} from "../../utils/utils-math";

export const positioner = {
    negotiationX() {
        const bridgePos = positioner.bridgePosition();
        return bridgePos.x + bridgePos.width * 0.7;
    },

    bridgePosition() {
        const gameSize = getGameSize();
        return {
            x: 0,
            y: gameSize.height / 6,
            width: gameSize.width,
            height: gameSize.height / 2,
        }
    },

    getLairPosition() {
        const gameSize = getGameSize();
        return {
            x: gameSize.width / 4,
            y: gameSize.height * 2 / 3,
            width: gameSize.width / 2,
            height: gameSize.height / 3,
        }
    },

    getFoodStoragePosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + 150,
            y: pos.y + pos.height * 4 / 4
        }
    },

    getBedPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + 100,
            y: pos.y + pos.height * 1 / 4,
        }
    },

    getPotPosition() {
        const pos = positioner.getLairPosition();
        return {
            x: pos.x + 100,
            y: pos.y + pos.height * 2.5 / 4,
        }
    },

    getRandomPlaceForMeat() {
        const foodStoragePos = this.getFoodStoragePosition()
        const xRand = rndBetween(-20, 20)
        const yRand = rndBetween(-20, 20)
        return {x: foodStoragePos.x - 100 + xRand, y: foodStoragePos.y - 50 + yRand}
    },

    getPrisonerPosition() {
        const pos = positioner.getLairPosition();
        const prisonersAmount = o_.characters.getPrisoners().length
        return {
            x: pos.x + pos.width / 2 + prisonersAmount * 50,
            y: pos.y + pos.height * 0.5
        }
    }
}