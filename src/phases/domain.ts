export const PhaseKeys = {
    BATTLE: 'battle',
    AFTER_BATTLE_WON: 'afterBattleWon',
    BRIDGE: 'bridge',
    BUILD: 'build',
    LAIR: 'lair',
    MAKE_FOOD: 'makeFood',
    NEGOTIATIONS: 'negotiations',
} as const;

export type PhaseKey = typeof PhaseKeys[keyof typeof PhaseKeys]