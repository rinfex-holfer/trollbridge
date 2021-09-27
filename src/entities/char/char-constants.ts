export const enum CharStateKey {
    IDLE = 'IDLE',
    GO_ACROSS = 'GO_ACROSS',
    GO_TO_TALK = 'GO_TO_TALK',
    SURRENDER = 'SURRENDER',
    // PRISONER = 'PRISONER',
    DEAD = 'DEAD',
    BONES = 'BONES',
    GO_TO_BATTLE_POSITION = 'GO_TO_BATTLE_POSITION',
    BATTLE_IDLE = 'BATTLE_IDLE',
    BATTLE_ATTACK = 'BATTLE_ATTACK',
    BATTLE_GO_DEFEND = 'BATTLE_GO_DEFEND',
    BATTLE_SURRENDER = 'BATTLE_SURRENDER',
}

export const enum CharAnimation {
    WALK = 'walk',
    IDLE = 'idle',
    SURRENDER = 'scared',
    PRISONER = 'prisoner',
    DEAD = 'dead',
    STRIKE = 'strike',
}