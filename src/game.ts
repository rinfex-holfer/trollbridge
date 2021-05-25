import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
import {resourseLoader} from "./resource-loader";
import {RenderManager} from "./managers/core/render/render-manager";
import {Troll} from "./managers/game/troll/troll";
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
import {Meat} from "./entities/meat";
import {GrayScalePipeline} from "./shaders";

const size = getGameSize()
var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
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
    },
    // @ts-ignore
    pipeline: { 'Gray': GrayScalePipeline }
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
    new Troll()
    new Lair()
    new Negotiations()
    new BattleManager()

    new Meat({x: 100, y: 200})
    new Meat({x: 120, y: 200})
    new Meat({x: 140, y: 200})
    new Meat({x: 160, y: 200})
    new Meat({x: 170, y: 200})
    new Meat({x: 180, y: 200})
    new Meat({x: 190, y: 200})
    new Meat({x: 200, y: 200})
    new Meat({x: 210, y: 200})
    new Meat({x: 220, y: 200})
    new Meat({x: 230, y: 200})
    new Meat({x: 240, y: 200})

    scene.update = function(time, delta) {
        timeManager.onUpdate(delta);
    }
}

export const newGame = () => new Phaser.Game(config)


