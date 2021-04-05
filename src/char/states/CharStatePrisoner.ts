import {CharState} from "./CharState";
import {CharAnimation, CharStateKey} from "../char-constants";
import {CharAction} from "../../interface/char-actions-menu";
import {render} from "../../managers/render";
import {lair} from "../../managers/lair";
import {positioner} from "../../managers/positioner";

export class CharStatePrisoner extends CharState {
    key = CharStateKey.PRISONER

    onStart(): Promise<any> {
        this.char.isPrisoner = true;
        this.char.setAnimation(CharAnimation.PRISONER);
        const pos = positioner.getPrisonerPosition()
        render.move(this.char.id, pos.x, pos.y);
        this.char.actionsMenu.changeActiveButtons([
            CharAction.RELEASE,
            CharAction.KILL,
            CharAction.DEVOUR,
            CharAction.MAKE_FOOD,
        ])
        return Promise.resolve();
    }

    onEnd(): Promise<any> {
        this.char.isPrisoner = false;
        return Promise.resolve();
    }
}