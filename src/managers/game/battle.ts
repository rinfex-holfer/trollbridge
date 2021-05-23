import {eventBus, Evt} from "../../event-bus";
import {o_} from "../locator";
import {onEncounterEnd} from "../../helpers";

export class BattleManager {
    unsub: any[] = []

    isBattle = false

    constructor() {
        o_.register.battle(this);
    }

    startBattle() {
        this.isBattle = true;

        const fighters = o_.characters.getFighters();
        if (fighters.length === 0) {
            return o_.characters.allSurrender();
        }

        const sub = eventBus.on(Evt.TROLL_TURN_END, () => this.travellersTurn());
        this.unsub.push(() => eventBus.unsubscribe(Evt.TROLL_TURN_END, sub));

        o_.characters.startFighting();
        this.travellersTurn();
    }

    trollTurn() {
        o_.characters.enableInteractivityOnBridge();
    }

    async travellersTurn() {
        const fighters = o_.characters.getFighters();

        if (fighters.length === 0) {
            return this.win();
        }

        o_.characters.disableInteractivityAll();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
        }

        if (o_.troll.getIsAlive()) {
            this.trollTurn();
        } else {
            this.fail();
        }
    }

    fail() {
        this.onBattleEnd();
        o_.characters.letAllTravellersPass()
    }

    win() {
        this.onBattleEnd();
    }

    onBattleEnd() {
        this.isBattle = false;
        this.unsub.forEach(u => u())
        onEncounterEnd();
    }
}