import Phaser from "phaser";
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
import {outlinePipeline} from "./shaders/OutlinePipeline";
import {SaveManager} from "./managers/save-manager";
import {o_} from "./managers/locator";
import {createBasicManagers, createGameManagers, createSceneManagers} from "./game-utils";

const preload = (scene: Phaser.Scene) => {
    const gameLoader = new GameLoader(scene)
    gameLoader.load()
}

const create = (scene: Phaser.Scene) => {
    createGameManagers(scene)

    const saveData = o_.saves.getSaveData()
    createSceneManagers(saveData)

    new Gold({x: 720, y: 1200}, 1)
    new Gold({x: 740, y: 1200}, 2)
    new Gold({x: 760, y: 1200}, 3)
    new Gold({x: 780, y: 1200}, 4)
    new Gold({x: 700, y: 1200}, 100)
    new Gold({x: 800, y: 1200}, 100)

    scene.update = function (time, delta) {
        o_.time.onUpdate(delta);
    }

    gamePhaseCycle(new PhaseLair())
}

export const newGame = () => {
    createBasicManagers()

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

        // phaser types are WRONG here
        pipeline: {
            // @ts-ignore
            [outlinePipeline.name]: outlinePipeline.pipeline
        },
    };

    return new Phaser.Game(config)
}

console.log("OutlinePostFx")
// console.log(new OutlinePostFx({}));
