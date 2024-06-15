import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
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
import {Meat} from "./entities/items/meat/meat";
import {GrayScalePipeline} from "./shaders";
import {ItemManager} from "./managers/core/entities/items";
import {InteractionManager} from "./managers/core/interaction";
import {Gold} from "./entities/items/gold";
import {UpgradeManager} from "./managers/game/upgrade";
import {GameManager} from "./managers/game/game-manager";
import {MusicManager} from "./managers/core/music";
import {GameNotifications} from "./interface/game-notifications";
import {CameraManager} from "./managers/core/camera";
import {Ladder} from "./entities/buildings/ladder";
import {SettingsManager} from "./managers/core/settings";
import {gamePhaseCycle} from "./phases/game-phase-cycle";
import {PhaseLair} from "./phases/phase-lair";
import {InputManager} from "./managers/core/input";
import {MenuManager} from "./managers/core/menu";
import {GameLoader} from "./game-loader";
import {TextsManager} from "./managers/core/texts";

const preload = (scene: Phaser.Scene) => {
    const gameLoader = new GameLoader(scene)
    gameLoader.load()
}

const create = (scene: Phaser.Scene) => {
    new GameManager(scene)
    new InputManager(scene)
    new MenuManager()
    const timeManager = new TimeManager()
    new LayersManager(scene)
    new RenderManager(scene)
    new CameraManager(scene)
    new InteractionManager(scene)
    new ItemManager()
    new AudioManager(scene)
    new UpgradeManager()
    new Environment()
    new CharactersManager()
    new Lair()
    new BridgeManager()
    new Ladder()
    new Negotiations()
    new BattleManager()
    new Troll()
    new MusicManager()

    new GameNotifications()

    // new Meat({x: 660, y: 1200})
    // new Meat({x: 680, y: 1200})
    // new Meat({x: 600, y: 1200})
    // new Meat({x: 620, y: 1200})
    // new Meat({x: 640, y: 1200})
    // new Meat({x: 660, y: 1200})
    // new Meat({x: 670, y: 1200})
    // new Meat({x: 680, y: 1200})
    // new Meat({x: 690, y: 1200})
    new Gold({x: 720, y: 1200}, 1)
    new Gold({x: 740, y: 1200}, 2)
    new Gold({x: 760, y: 1200}, 3)
    new Gold({x: 780, y: 1200}, 4)
    new Gold({x: 700, y: 1200}, 100)
    new Gold({x: 800, y: 1200}, 100)

    scene.update = function (time, delta) {
        timeManager.onUpdate(delta);
    }

    gamePhaseCycle(new PhaseLair())
}

export const newGame = () => {
    new TextsManager()
    new SettingsManager()

    const size = getGameSize()

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.WEBGL,
        pixelArt: true,
        parent: document.getElementById('game-container')!,
        scale: {
            width: size.width,
            height: size.height,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {x: 0, y: 0}
            }
        },
        scene: {
            preload: function () {
                preload(this);
            },
            create: function () {
                create(this);
            }
        },
        // @ts-ignore
        pipeline: {'Gray': GrayScalePipeline}
    };

    return new Phaser.Game(config)
}


