import {o_} from "../locator";
import {eventBus} from "../../event-bus";
import {getRndItem} from "../../utils/utils-math";
import {MUSIC_KEY} from "./audio";
import {GamePhase} from "../../phases/game-phase";

export class PhaseManager {

    phase?: GamePhase

    constructor() {
        o_.register.phase(this)
    }

    runPhaseLoop = async (gamePhase: GamePhase) => {
        while (gamePhase) {
            this.phase = gamePhase
            console.log("new game phase:", gamePhase.name)
            const nextPhase = await gamePhase.run()
            gamePhase.end()
            gamePhase = nextPhase
        }
    }

    getGamePhaseName = () => {
        return this.phase?.name
    }

    getIsBattle = () => {
        return this.getGamePhaseName() === 'battle'
    }
}