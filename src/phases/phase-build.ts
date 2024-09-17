import {GamePhase} from "./game-phase";
import {PhaseLair} from "./phase-lair";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";


export class PhaseBuild extends GamePhase {

    name = "build"

    onStart() {
        o_.upgrade.showButtons(this.goToLairPhase)

        o_.lair.setInteractive.tools(true)
        o_.lair.tools.setAlwaysHighlighted(true)

        o_.items.getAll().forEach(i => i.setInteractive(false))

        this.registerListener(Evt.INTERFACE_TOOLS_CLICKED, () => {
            this.goToLairPhase()
        })

        this.registerListener(Evt.BUILDING_COMPLETED, () => {
            if (o_.upgrade.components.length === 0) {
                this.goToLairPhase()
            }
        })
    }

    goToLairPhase = () => {
        this.goToNextPhase(new PhaseLair())
    }

    protected onEnd() {
        o_.lair.tools.setAlwaysHighlighted(false)
        o_.upgrade.hideButtons()
        // o_.lair.setInteractive.tools(false)
    }
}