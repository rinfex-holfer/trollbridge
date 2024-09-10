import Phaser from "phaser";
import {getGameSize} from "./utils/utils-misc";
import {Gold, GoldLocation} from "./entities/items/gold";
import {gamePhaseCycle} from "./phases/game-phase-cycle";
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

    const saveData = o_.saves.getSaveData()
    createSceneManagers(saveData)

    // new Gold({position: {x: 720, y: 1200}, amount: 1, location: GoldLocation.GROUND})
    // new Gold({position: {x: 740, y: 1200}, amount: 2, location: GoldLocation.GROUND})
    // new Gold({position: {x: 760, y: 1200}, amount: 3, location: GoldLocation.GROUND})
    // new Gold({position: {x: 780, y: 1200}, amount: 4, location: GoldLocation.GROUND})
    // new Gold({position: {x: 700, y: 1200}, amount: 100, location: GoldLocation.GROUND})
    // new Gold({position: {x: 800, y: 1200}, amount: 100, location: GoldLocation.GROUND})

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
