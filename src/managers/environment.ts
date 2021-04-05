import {GameSprite} from "../type-aliases";
import {render} from "./render";
import {resoursePaths} from "../resourse-paths";
import {getGameSize} from "../utils/utils-misc";

export class Environment {
    bg: GameSprite
    bgId = 'background'

    constructor() {
        const {width} = getGameSize();
        this.bg = render.createSprite({
            entityId: this.bgId,
            path: resoursePaths.images.background,
            x: 0,
            y: 0,
            width,
        })
    }
}