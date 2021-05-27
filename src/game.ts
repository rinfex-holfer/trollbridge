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
import {EntityManager} from "./managers/core/entities";
import {InteractionManager} from "./managers/core/interaction";
import {Gold} from "./entities/gold";
import {UpgradeManager} from "./managers/game/upgrade";

const size = getGameSize()
var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: size.width,
    height: size.height,
    pixelArt: true,
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
    new InteractionManager(scene)
    new EntityManager()
    const timeManager = new TimeManager()
    new LayersManager(scene)
    new RenderManager(scene)
    new AudioManager(scene)
    new UpgradeManager()
    new Environment()
    new BridgeManager()
    new CharactersManager()
    new Troll()
    new Lair()
    new Negotiations()
    new BattleManager()

    new Meat({x: 100, y: 300})
    new Meat({x: 120, y: 300})
    new Meat({x: 140, y: 300})
    new Meat({x: 160, y: 300})
    new Meat({x: 180, y: 300})
    new Meat({x: 200, y: 300})
    new Gold({x: 220, y: 300}, 1)
    new Gold({x: 240, y: 300}, 2)
    new Gold({x: 260, y: 300}, 3)
    new Gold({x: 280, y: 300}, 4)
    new Gold({x: 300, y: 300}, 10)
    new Gold({x: 320, y: 300}, 20)
    new Gold({x: 320, y: 300}, 40)
    new Gold({x: 320, y: 300}, 50)
    new Gold({x: 320, y: 300}, 100)

    scene.update = function(time, delta) {
        timeManager.onUpdate(delta);
    }
}

export const newGame = () => new Phaser.Game(config)


