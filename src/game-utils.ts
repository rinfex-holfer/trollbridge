import {SaveData, SaveManager} from "./managers/save-manager";
import {ItemManager} from "./managers/game/items";
import {UpgradeManager} from "./managers/game/upgrade";
import {Environment} from "./managers/game/environment";
import {CharactersManager} from "./managers/game/characters";
import {Lair} from "./managers/game/lair";
import {BridgeManager} from "./managers/game/bridge";
import {Ladder} from "./entities/buildings/ladder";
import {BattleManager} from "./managers/game/battle";
import {Troll} from "./managers/game/troll/troll";
import {GameManager} from "./managers/game/game-manager";
import {InputManager} from "./managers/core/input";
import {MenuManager} from "./managers/core/menu";
import {TimeManager} from "./managers/core/time";
import {LayersManager} from "./managers/core/layers";
import {RenderManager} from "./managers/core/render/render-manager";
import {CameraManager} from "./managers/core/camera";
import {InteractionManager} from "./managers/core/interaction";
import {AudioManager} from "./managers/core/audio";
import {MusicManager} from "./managers/core/music";
import {GameNotifications} from "./interface/game-notifications";
import {Scene} from "phaser";
import {o_} from "./managers/locator";
import {TextsManager} from "./managers/core/texts";
import {SettingsManager} from "./managers/core/settings";

// managers that
// - don't need re-instantiate and can be created once
// - don't depend on Phaser game instance
// - could be created without any dependencies on game state and Phaser game instance
export const createBasicManagers = () => {
    new SaveManager()
    new TextsManager()
    new SettingsManager()
}

// managers that
// - don't need re-instantiate and can be created once
export const createGameManagers = (scene: Scene) => {
    new GameManager(scene)
    const inputManager = new InputManager(scene)
    new MenuManager()
    new TimeManager()
    new LayersManager(scene)
    new RenderManager(scene)

    inputManager.initializeCursor()

    new CameraManager(scene)
    new InteractionManager(scene)
    new AudioManager(scene)
    new MusicManager()
    new GameNotifications()
}

export const createSceneManagers = (saveData?: SaveData) => {
    new ItemManager(saveData)
    new UpgradeManager()
    new Environment()
    new CharactersManager()
    new Lair(saveData)
    new BridgeManager()
    new Ladder()
    new BattleManager()

    new Troll()
}

export const resetSceneManagers = (saveData?: SaveData) => {
    o_.items.reset(saveData)
    o_.upgrade.reset()
    o_.characters.reset(saveData)
    o_.lair.reset(saveData)
    o_.bridge.reset()
    o_.battle.reset()
    o_.troll.reset()
}

export const cleanupGameScene = () => {
    o_.lair.cleanup()
}