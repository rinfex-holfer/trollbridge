import {characters} from "./characters";
import {eventBus, Evt} from "../event-bus";
import {getTroll} from "./troll";

class BattleManager {
    unsub: any[] = []

    isBattle = false

    startBattle() {
        this.isBattle = true;

        const fighters = characters.getFighters();
        if (fighters.length === 0) {
            return characters.allSurrender();
        }

        const sub = eventBus.on(Evt.TROLL_TURN_END, () => this.travellersTurn());
        this.unsub.push(() => eventBus.unsubscribe(Evt.TROLL_TURN_END, sub));

        characters.startFighting();
        this.travellersTurn();
    }

    trollTurn() {
        characters.enableInteractivityAll();
    }

    async travellersTurn() {
        const fighters = characters.getFighters();

        if (fighters.length === 0) {
            return this.win();
        }

        characters.disableInteractivityAll();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
        }

        if (getTroll().getIsAlive()) {
            this.trollTurn();
        } else {
            this.fail();
        }
    }

    fail() {
        this.onBattleEnd();
        characters.letAllTravellersPass()
    }

    win() {
        this.onBattleEnd();
    }

    onBattleEnd() {
        this.isBattle = false;
        this.unsub.forEach(u => u())
        eventBus.emit(Evt.ENCOUNTER_ENDED);
    }
}

export const battleManager = new BattleManager();