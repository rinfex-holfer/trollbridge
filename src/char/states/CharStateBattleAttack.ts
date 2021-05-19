import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../managers/positioner";
import {trollManager} from "../../managers/troll";

export class CharStateBattleAttack extends CharState {
    key = CharStateKey.BATTLE_ATTACK

    toTroll = true
    attackInProcess = false;
    phase: 'forward' | 'backward' | 'attacking' = 'forward'

    beforeAttack = 300


    update(dt: number) {
        if (this.beforeAttack > 0) {
            this.beforeAttack -= dt;
            if (this.beforeAttack <= 0) {
                this.char.setAnimation(CharAnimation.WALK);
            }
            return;
        }
        const startX = positioner.negotiationX()
        const trollX = trollManager.container.x;
        const y = this.char.getCoords().y;

        if (this.phase === 'attacking') return;

        if (this.phase === 'forward') {
            const distanceLeft = this.char.moveTowards(dt, trollX, y)

            if (distanceLeft <= 100) {
                this.phase = 'attacking'
                this.char.setAnimation(CharAnimation.STRIKE, false, () => {
                    this.attack();
                    this.phase = 'backward'
                    this.char.setAnimation(CharAnimation.WALK)
                })
            }
        } else if (this.phase === 'backward') {
            const distanceLeft = this.char.moveTowards(dt, startX, y)

            if (distanceLeft <= 0) {
                this.char.endAttack();
            }
        }
    }

    attack() {
        trollManager.getHit(this.char.rollDmg());
    }
}