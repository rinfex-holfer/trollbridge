import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
import {resourseLoader} from "./resource-loader";
import {RenderManager} from "./managers/core/render/render-manager";
import {Troll} from "./managers/game/troll";
import {getGameSize} from "./utils/utils-misc";
import {BridgeManager} from "./managers/game/bridge";
import {Environment} from "./managers/game/environment";
import {Lair} from "./managers/game/lair";
import {CharactersManager} from "./managers/game/characters";
import {Negotiations} from "./managers/game/negotiations";
import {AudioManager} from "./managers/core/audio";
import {TimeManager} from "./managers/core/time";
import {BattleManager} from "./managers/game/battle";
import {LayersManager} from "./managers/core/layers";

const size = getGameSize()
var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: size.width,
    height: size.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
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
    const timeManager = new TimeManager()
    new LayersManager(scene)
    new RenderManager(scene)
    new AudioManager(scene)
    new Environment()
    new BridgeManager()
    new CharactersManager()
    new Lair()
    new Troll()
    new Negotiations()
    new BattleManager()

    scene.update = function(time, delta) {
        timeManager.onUpdate(delta);
    }
}

export const newGame = () => new Phaser.Game(config);

