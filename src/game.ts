import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
import {resourseLoader} from "./resource-loader";
import {render} from "./managers/render";
import {Troll} from "./managers/troll";
import {getGameSize} from "./utils/utils-misc";
import {bridgeManager} from "./managers/bridge-manager";
import {Environment} from "./managers/environment";
import {lair} from "./managers/lair";

const size = getGameSize()
var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: size.width,
    height: size.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: function() {
            resourseLoader.load(this)
            preload(this);
        },
        create: function() {
            create(this);
        }
    }
};

const preload = (scene: Phaser.Scene) => {
    const imgKeys = Object.keys(resoursePaths.images) as (keyof typeof resoursePaths.images)[];
    imgKeys.forEach(key => scene.load.image(key, resoursePaths.images[key]))
}

const create = (scene: Phaser.Scene) => {
    render.init(scene);
    new Environment();

    bridgeManager.init();
    lair.init();
    new Troll()
}

export const newGame = () => new Phaser.Game(config);

