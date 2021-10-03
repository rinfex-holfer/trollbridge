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
        this.char.moveTowards(o_.troll.sprite.x, o_.troll.sprite.y)
        this.char.setAnimation(CharAnimation.WALK);
    }

    update(dt: number) {
        if (this.phase === 'attacking') return;

        const battlePosition = this.char.getBattleCoords()

        if (this.phase === 'forward') {
            const distanceLeft = getDistanceBetween(this.char.container, {x: o_.troll.sprite.x, y: o_.troll.sprite.y})

            if (distanceLeft <= 100) {
                this.char.stop();
                this.phase = 'attacking'
                this.char.setAnimation(CharAnimation.STRIKE, false, () => {
                    this.attack();
                    this.phase = 'backward'
                    this.char.moveTowards(battlePosition.x, battlePosition.y)
                    this.char.setAnimation(CharAnimation.WALK)
                })
            }
        } else if (this.phase === 'backward') {
            const step = (this.char.speed / 1000) * dt
            const distanceLeft = getDistanceBetween(this.char.container, battlePosition)
            if (distanceLeft <= step) {
                this.char.container.x = battlePosition.x
                this.char.container.y = battlePosition.y
                this.char.stop();
                this.char.endAttack();
            }
        }
    }

    attack() {
        o_.troll.getHit(this.char.rollDmg());
    }
}