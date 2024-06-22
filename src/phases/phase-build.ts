import {GamePhase} from "./game-phase";
import {PhaseLair} from "./phase-lair";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";


// TODO ============== строить можно и в логове, и на мосту


export class PhaseBuild extends GamePhase {

    name = "build"

    onStart() {
        o_.upgrade.showButtons(this.goToLairPhase)

        o_.lair.setInteractive.tools(true)

        this.registerListener(Evt.INTERFACE_TOOLS_CLICKED, () => {
            this.goToLairPhase()
        })

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
        o_.lair.setInteractive.tools(false)
    }
}