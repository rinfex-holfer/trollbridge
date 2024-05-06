import {GamePhase} from "./game-phase";

export async function gamePhaseCycle(gamePhase: GamePhase) {
    while (gamePhase) {
        const nextPhase = await gamePhase.run()
        gamePhase.end()
        gamePhase = nextPhase
    }
}