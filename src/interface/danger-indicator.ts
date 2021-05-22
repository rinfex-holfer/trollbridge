// import {render} from "../managers/render";
// import {colors} from "../constants";
// import {Container, GameText} from "../type-aliases";
// import {lair} from "../managers/lair";
// import {bridgeManager} from "../managers/bridge-manager";
// import {EncounterDanger} from "../types";
//
// export class DangerIndicator {
//     text: GameText
//
//     constructor(x: number, y: number) {
//         this.text = render.createText(
//             '',
//             x,
//             y,
//             {
//                 align: 'right',
//                 fill: colors.WHITE,
//                 fontStyle: 'italic',
//                 wordWrapWidth: 200,
//                 fontSize: 18,
//                 wordWrap: false
//             }
//         )
//         // this.text.anchor.set(1, 0);
//     }
//
//     setDanger(dangerLevel: EncounterDanger, who: string) {
//         let text = 'мимо проходят: ' + who +  ', опасность: ';
//         switch (dangerLevel) {
//             case EncounterDanger.NONE:
//                 text += 'НЕТ'
//                 break;
//             case EncounterDanger.LOW:
//                 text += 'НИЗКАЯ'
//                 break;
//             case EncounterDanger.MEDIUM:
//                 text += 'СРЕДНЯЯ'
//                 break;
//             case EncounterDanger.HIGH:
//                 text += 'ВЫСОКАЯ'
//                 break;
//             case EncounterDanger.VERY_HIGH:
//                 text += 'ОЧЕНЬ ВЫСОКАЯ'
//                 break;
//             case EncounterDanger.IMPOSSIBLE:
//                 text += 'БЕЗНАДЕЖНО'
//                 break;
//
//         }
//         this.text.text = text;
//     }
//
//     clearDanger() {
//         this.text.text = '';
//     }
// }