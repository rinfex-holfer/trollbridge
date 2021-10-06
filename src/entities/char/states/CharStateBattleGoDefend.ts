import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {o_} from "../../../managers/locator";
import {Char} from "../char";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export class CharStateBattleGoDefend extends CharState {
    key = CharStateKey.BATTLE_GO_DEFEND

    charToDefend: Char
    target: Vec

    constructor(host: Char, options: {target: Char}) {
        super(host);
        this.charToDefend = options.target
        this.target = this.charToDefend.getDefenderPosition()

        const {promise, done} = createPromiseAndHandlers()
        this.char.movePromise = promise
        this.char.onMoveEnd = done
    }

    onStart() {

        this.char.moveTowards(this.target.x, this.target.y)
        this.char.setAnimation(CharAnimation.WALK);
    }

    onEnd() {
        this.char.onMoveEnd()
    }

    update(dt: number) {
        const distanceLeft = getDistanceBetween(this.char.container, this.target)

        if (distanceLeft <= 10) {
            this.char.stop();
            this.char.setState(CharStateKey.IDLE)
        }
    }
}