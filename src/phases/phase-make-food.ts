import {GamePhase} from "./game-phase";
import {o_} from "../managers/locator";
import {foodConfig} from "../configs/food-config";
import {SOUND_KEY} from "../managers/core/audio";
import {PhaseLair} from "./phase-lair";
import {PotState} from "../entities/buildings/pot";
import {Evt} from "../event-bus";
import {Meat} from "../entities/meat/meat";

import {EntityType} from "../entities/types";


export class PhaseMakeFood extends GamePhase {
    name = "cook"
    unsubFromRightClick = () => {
    }

    static checkCanBeStarted() {
        const freshMeet = o_.entities.get(EntityType.MEAT);

        if (freshMeet.length < foodConfig.FOOD_FOR_DISH) {
            o_.audio.playSound(SOUND_KEY.CANCEL)
            o_.lair.pot.showText();
            return false;
        }

        return true;
    }

    onStart() {
        if (!PhaseMakeFood.checkCanBeStarted()) {
            this.goToLairPhase()
            return
        }

        o_.audio.playSound(SOUND_KEY.BONK)

        o_.lair.pot.setInteractive(true)

        o_.lair.pot.startChoosingFood()

        this.unsubFromRightClick = o_.interaction.onRightClick(() => {
            this.interruptChoosing()
        })

        this.registerListener(Evt.INTERFACE_POT_CLICKED, this.onPotClicked)
    }

    interruptChoosing() {
        o_.audio.playSound(SOUND_KEY.CANCEL)
        this.goToLairPhase()
    }

    onPotClicked = (potState: PotState) => {
        switch (potState) {
            case PotState.EMPTY:
                // TODO do we need this?
                this.interruptChoosing()
                break;
        }
    }

    onEnd() {
        this.unsubFromRightClick()
        o_.lair.pot.stopChoosingFood()
        o_.entities.get(EntityType.MEAT).forEach(meat => {
            meat.setJumping(false)
            meat.setOnClick(undefined)
        })
    }

    goToLairPhase() {
        this.goToNextPhase(new PhaseLair())
    }
}