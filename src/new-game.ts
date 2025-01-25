import Phaser from "phaser";
import {getGameSize} from "./utils/utils-misc";
import {PhaseLair} from "./phases/phase-lair";
import {GameLoader} from "./game-loader";
import {outlinePipeline} from "./shaders/OutlinePipeline";
import {o_} from "./managers/locator";
import {createBasicManagers, createGameManagers, createSceneManagers} from "./game-utils";

const preload = (scene: Phaser.Scene) => {
    const gameLoader = new GameLoader(scene)
    gameLoader.load()
}

const create = (scene: Phaser.Scene) => {
    createGameManagers(scene)

    const gameInProgress = o_.saves.getGameInProgress()
    if (gameInProgress) {
        o_.saves.setGameInProgress(null)
        createSceneManagers(gameInProgress)
    } else {
        createSceneManagers(o_.saves.getLatestSave())
    }

    scene.update = function (time, delta) {
        o_.time.onUpdate(delta);
    }

    o_.phase.runPhaseLoop(new PhaseLair())
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
