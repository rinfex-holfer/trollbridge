// import {CharState} from "./CharState";
// import {CharAnimation, CharStateKey} from "../char-constants";
// import {CharAction} from "../../../interface/char-actions-menu";
// import {positioner} from "../../../managers/game/positioner";
//
// export class CharStatePrisoner extends CharState {
//     key = CharStateKey.PRISONER
//
//     onStart() {
//         this.char.isPrisoner = true;
//         this.char.setAnimation(CharAnimation.PRISONER);
//         const pos = positioner.getPrisonerPosition()
//         this.char.container.move(pos.x, pos.y)
//         this.char.actionsMenu.changeActiveButtons([
//             CharAction.RELEASE,
//             CharAction.KILL,
//             CharAction.DEVOUR,
//             CharAction.MAKE_FOOD,
//         ])
//     }
//
//     onEnd() {
//         this.char.isPrisoner = false;
//     }
// }