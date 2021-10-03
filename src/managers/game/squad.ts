import {SquadPlace} from "../../types";
import {Char} from "../../entities/char/Char";
import {getRndItem, rndBetween, Vec} from "../../utils/utils-math";
import {positioner} from "./positioner";

export class Squad {
    speaker: Char | null

    placeToChar: {[key: number]: Char} = {}
    chars: Char[] = []

    constructor(chars: [SquadPlace, Char][], speakerIdx?: number) {
        speakerIdx = speakerIdx ?? rndBetween(0, chars.length - 1)
        this.speaker = chars.length ? chars[speakerIdx][1] : null

        chars.forEach(([place, char]) => {
            this.placeToChar[place] = char
            this.chars.push(char)
            char.squad = this
            char.squadPlace = place

            const startCoord = this.getStartCoordForPlace(place)
            char.container.x = startCoord.x
            char.container.y = startCoord.y
        })
    }

    getStartCoordForPlace(place: SquadPlace): Vec {
        const bridgePos = positioner.bridgePosition()
        const startY = bridgePos.height / 5 + bridgePos.y + bridgePos.height / 5
        const marginY = bridgePos.height / 5;
        const startX = bridgePos.x + bridgePos.width - 50
        const marginX = marginY

        return {
            x: place <= 2 ? startX : startX + marginX,
            y: startY + (place % 3) * marginY
        }
    }

    getBattleCoordsForPlace(place: SquadPlace): Vec {
        const bridgePos = positioner.bridgePosition()
        const startY = bridgePos.height / 5 + bridgePos.y + bridgePos.height / 5
        const marginY = bridgePos.height / 5;
        const startX = bridgePos.x + bridgePos.width * 0.7
        const marginX = marginY

        return {
            x: place <= 2 ? startX : startX + marginX,
            y: startY + (place % 3) * marginY
        }
    }

    enableBattleActionButtons() {

    }

    removeChar(char: Char) {
        if (char.squadPlace === null) throw Error('wtf')
        delete this.placeToChar[char.squadPlace]
        char.squadPlace = null
        char.squad = null

        const charIdx = this.chars.findIndex(c => c === char)
        if (charIdx === -1) return

        this.chars.splice(charIdx, 1)

        if (this.speaker === char) this.speaker = this.chars.length ? getRndItem(this.chars) : null
    }

    getDefenderOf(char: Char): Char | null {
        if (char.squad === null || char.squadPlace === null) throw Error('wtf')

        const defenders = this.getPossibleDefendersOf(char.squadPlace).filter(c => c.canProtect(char))

        if (defenders.length === 0) return null

        return getRndItem(defenders)
    }

    /**
     *  0   3
     *  1   4
     *  2   5
     */

    getPossibleDefendersOf(place: SquadPlace): Char[] {
        let places = [] as SquadPlace[]
        switch (place) {
            case 0:
                places = [1]
                break;
            case 1:
                places = [0, 2]
                break;
            case 2:
                places = [1]
                break;
            case 3:
                places = [0, 1, 4]
                break;
            case 4:
                places = [0, 1, 2, 3, 5]
                break;
            case 5:
                places = [1, 2, 4]
                break;
        }

        return places.reduce((acc, next) => {
            const defender = this.placeToChar[next]
            if (defender) acc.push(defender)
            return acc
        }, [] as Char[])
    }

    say(text: string) {
        if (!this.speaker) console.error('no speaker')
        else this.speaker.say(text)
    }
}