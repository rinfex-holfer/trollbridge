import {GamePhase} from "./game-phase";

export async function gamePhaseCycle(gamePhase: GamePhase) {
    while (gamePhase) {
        console.log("new game phase:", gamePhase.name)
        const nextPhase = await gamePhase.run()
        gamePhase.end()
        gamePhase = nextPhase
    }
}