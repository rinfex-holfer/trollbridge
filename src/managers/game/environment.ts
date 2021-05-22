import {getGameSize} from "../../utils/utils-misc";
import {O_Sprite} from "../core/render/sprite";
import {o_} from "../locator";

export class Environment {
    bg: O_Sprite

    constructor() {
        const size = getGameSize();
        this.bg = o_.render.createSprite('background', 0, 0, { width: size.width, height: size.height } )
        this.bg.setOrigin(0, 0);
    }
}