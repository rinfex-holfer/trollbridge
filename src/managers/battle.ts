import {characters} from "./characters";
import {eventBus, Evt} from "../event-bus";
import {trollManager} from "./troll-manager";

class BattleManager {
    unsub: any[] = []

    startBattle() {
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
        characters.enableActionMenuForAll();
    }

    async travellersTurn() {
        const fighters = characters.getFighters();

        console.log(fighters);
        if (fighters.length === 0) {
            return this.win();
        }

        characters.disableActionMenuForAll();

        for (let i = 0; i < fighters.length; i++) {
            await fighters[i].performBattleAction();
        }

        if (trollManager.getIsAlive()) {
            this.trollTurn();
        } else {
            this.fail();
        }
    }

    fail() {
        characters.letAllTravellersPass()
        eventBus.emit(Evt.ENCOUNTER_ENDED);
    }

    win() {
        eventBus.emit(Evt.ENCOUNTER_ENDED);
        this.unsub.forEach(u => u())
    }
}

export const battleManager = new BattleManager();