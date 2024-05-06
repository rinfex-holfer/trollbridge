import {GamePhase} from "./game-phase";
import {PhaseLair} from "./phase-lair";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";

export class PhaseBuild extends GamePhase {
    onStart() {
        o_.upgrade.showButtons(this.goToLairPhase)

        this.registerListener(Evt.BUILDING_COMPLETED, () => {
            if (o_.upgrade.buttons.length === 0) {
                this.goToLairPhase()
            }
        })
    }

    goToLairPhase = () => {
        this.goToNextPhase(new PhaseLair())
    }

    protected onEnd() {
        o_.upgrade.hideButtons()
    }
}