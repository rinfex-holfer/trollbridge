import {Sprite} from "./render";
import {getGameSize} from "../utils/utils-misc";

export class Environment {
    bg: Sprite

    constructor() {
        const size = getGameSize();
        console.log(size);
        this.bg = new Sprite('background', 0, 0, { width: size.width, height: size.height } )
        this.bg.setOrigin(0, 0);
    }
}