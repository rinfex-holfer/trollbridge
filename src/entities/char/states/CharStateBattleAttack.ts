import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../../managers/game/positioner";
import {getDistanceBetween} from "../../../utils/utils-math";
import {o_} from "../../../managers/locator";

export class CharStateBattleAttack extends CharState {
    key = CharStateKey.BATTLE_ATTACK

    phase: 'forward' | 'backward' | 'attacking' = 'forward'

    beforeAttack = 300

    onStart() {
        this.char.moveTowards(o_.troll.sprite.x, this.char.getCoords().y)
    }

    update(dt: number) {
        if (this.beforeAttack > 0) {
            this.beforeAttack -= dt;
            if (this.beforeAttack <= 0) {
                this.char.setAnimation(CharAnimation.WALK);
            }
            return;
        }
        const startX = positioner.negotiationX()
        const trollX = o_.troll.sprite.x;
        const y = this.char.getCoords().y;

        if (this.phase === 'attacking') return;

        if (this.phase === 'forward') {
            const distanceLeft = getDistanceBetween(this.char.container, {x: trollX, y})

            if (distanceLeft <= 100) {
                this.char.stop();
                this.phase = 'attacking'
                this.char.setAnimation(CharAnimation.STRIKE, false, () => {
                    this.attack();
                    this.phase = 'backward'
                    this.char.moveTowards(startX, y)
                    this.char.setAnimation(CharAnimation.WALK)
                })
            }
        } else if (this.phase === 'backward') {
            const distanceLeft = getDistanceBetween(this.char.container, {x: startX, y})
            if (distanceLeft <= 0) {
                this.char.stop();
                this.char.endAttack();
            }
        }
    }

    attack() {
        o_.troll.getHit(this.char.rollDmg());
    }
}