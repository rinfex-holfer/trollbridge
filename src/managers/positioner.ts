import {getGameSize} from "../utils/utils-misc";
import {charManager} from "./characters";

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
            height: gameSize.height / 3,
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
            x: pos.x + 50,
            y: pos.y + pos.height * 3 / 4
        }
    },

    getPrisonerPosition() {
        const pos = positioner.getLairPosition();
        const prisonersAmount = charManager.getPrisoners().length
        return {
            x: pos.x + pos.width / 2 + prisonersAmount * 50,
            y: pos.y + pos.height * 0.5
        }
    }
}