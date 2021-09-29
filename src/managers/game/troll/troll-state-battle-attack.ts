import {TrollState, TrollStateKey} from "./troll-state";
import {Troll} from "./troll";
import {CharAnimation} from "../../../entities/char/char-constants";
import {o_} from "../../locator";
import {createPromiseAndHandlers} from "../../../utils/utils-async";

export class TrollStateBattleAttack extends TrollState {
    key = TrollStateKey.BATTLE_ATTACK

    targetId: string

    constructor(host: Troll, options: {targetId: string}) {
        super(host);
        this.targetId = options.targetId
    }

    onStart() {
        this.host.strike(o_.characters.getTraveller(this.targetId)).then(() => this.host.goIdle())
    }
}