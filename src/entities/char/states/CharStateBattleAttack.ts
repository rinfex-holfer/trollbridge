import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {positioner} from "../../../managers/game/positioner";
import {getDistanceBetween} from "../../../utils/utils-math";
import {o_} from "../../../managers/locator";
import {Char} from "../Char";

export class CharStateBattleAttack extends CharState {
    key = CharStateKey.BATTLE_ATTACK

    phase: 'forward' | 'backward' | 'attacking' = 'forward'

    beforeAttack = 0

    constructor(host: Char, options?: {beforeAttack: number}) {
        super(host);

        this.beforeAttack = options ? options.beforeAttack : 0
    }

    onStart() {
        this.char.moveTowards(o_.troll.sprite.x, this.char.getCoords().y)
        this.char.setAnimation(CharAnimation.WALK);
    }

    update(dt: number) {
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