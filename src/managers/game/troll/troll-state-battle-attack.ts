import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export class TrollStateBattleAttack extends TrollState {
    key = TrollStateKey.BATTLE_ATTACK

    targetId: string
    minDistance: number = 10

    constructor(host: Troll, options: {targetId: string}) {
        super(host);
        this.targetId = options.targetId
    }

    onStart() {
        this.host.setAnimation(CharAnimation.STRIKE, () => {
            o_.characters.hitChar(this.targetId, this.host.rollDmg())
            this.host.setAnimation(CharAnimation.IDLE)
            this.host.goIdle()
        })
    }
}