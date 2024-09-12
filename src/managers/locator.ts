import {RenderManager} from "./core/render/render-manager";
import {CharactersManager} from "./game/characters";
import {BridgeManager} from "./game/bridge";
import {Lair} from "./game/lair";
import {Troll} from "./game/troll/troll";
import {AudioManager} from "./core/audio";
import {TimeManager} from "./core/time";
import {GameManager} from "./game/game-manager";
import {BattleManager} from "./game/battle";
import {LayersManager} from "./core/layers";
import {ItemManager} from "./game/items";
import {InteractionManager} from "./core/interaction";
import {UpgradeManager} from "./game/upgrade";
import {Negotiations} from "./game/negotiations";
import {MusicManager} from "./core/music";
import {CameraManager} from "./core/camera";
import {SettingsManager} from "./core/settings";
import {InputManager} from "./core/input";
import {MenuManager} from "./core/menu";
import {TextsManager} from "./core/texts";
import {SaveManager} from "./save-manager";

class Locator {
    #_render: RenderManager | undefined
    #_characters: CharactersManager | undefined
    #_bridge: BridgeManager | undefined
    #_lair: Lair | undefined
    #_troll: Troll | undefined
    #_audio: AudioManager | undefined
    #_music: MusicManager | undefined
    #_time: TimeManager | undefined
    #_game: GameManager | undefined
    #_battle: BattleManager | undefined
    #_negotiations: Negotiations | undefined
    #_layers: LayersManager | undefined
    #_items: ItemManager | undefined
    #_interaction: InteractionManager | undefined
    #_input: InputManager | undefined
    #_menu: MenuManager | undefined
    #_upgrade: UpgradeManager | undefined
    #_camera: CameraManager | undefined;
    #_settings: SettingsManager | undefined;
    #_saves: SaveManager | undefined;
    #_texts: TextsManager | undefined;

    static crashStr(m: string) {
        return 'trying access ' + m + ' before it was created';
    }

    register = {
        render: (render: RenderManager) => {
            this.#_render = render
        },
        characters: (characters: CharactersManager) => {
            this.#_characters = characters
        },
        bridge: (bridge: BridgeManager) => {
            this.#_bridge = bridge
        },
        lair: (lair: Lair) => {
            this.#_lair = lair
        },
        troll: (troll: Troll) => {
            this.#_troll = troll
        },
        audio: (audio: AudioManager) => {
            this.#_audio = audio
        },
        music: (music: MusicManager) => {
            this.#_music = music
        },
        time: (time: TimeManager) => {
            this.#_time = time
        },
        game: (game: GameManager) => {
            this.#_game = game
        },
        battle: (battle: BattleManager) => {
            this.#_battle = battle
        },
        layers: (layers: LayersManager) => {
            this.#_layers = layers
        },
        items: (items: ItemManager) => {
            this.#_items = items
        },
        interaction: (interaction: InteractionManager) => {
            this.#_interaction = interaction
        },
        input: (inputManager: InputManager) => {
            this.#_input = inputManager
        },
        menu: (menuManager: MenuManager) => {
            this.#_menu = menuManager
        },
        upgrade: (upgrade: UpgradeManager) => {
            this.#_upgrade = upgrade
        },
        negotiations: (negotiations: Negotiations) => {
            this.#_negotiations = negotiations
        },
        camera: (camera: CameraManager) => {
            this.#_camera = camera
        },
        settings: (settings: SettingsManager) => {
            this.#_settings = settings
        },
        saves: (saves: SaveManager) => {
            this.#_saves = saves
        },
        texts: (textsManager: TextsManager) => {
            this.#_texts = textsManager
        }
    }

    get render() {
        if (!this.#_render) throw Error(Locator.crashStr('render'))
        return this.#_render;
    }

    get characters() {
        if (!this.#_characters) throw Error(Locator.crashStr('characters'))
        return this.#_characters
    }

    get bridge() {
        if (!this.#_bridge) throw Error(Locator.crashStr('bridge'))
        return this.#_bridge
    }

    get lair() {
        if (!this.#_lair) throw Error(Locator.crashStr('lair'))
        return this.#_lair
    }

    get troll() {
        if (!this.#_troll) throw Error(Locator.crashStr('troll'))
        return this.#_troll
    }

    get audio() {
        if (!this.#_audio) throw Error(Locator.crashStr('audio'))
        return this.#_audio
    }

    get music() {
        if (!this.#_music) throw Error(Locator.crashStr('music'))
        return this.#_music
    }

    get time() {
        if (!this.#_time) throw Error(Locator.crashStr('time'))
        return this.#_time
    }

    get game() {
        if (!this.#_game) throw Error(Locator.crashStr('game'))
        return this.#_game
    }

    get battle() {
        if (!this.#_battle) throw Error(Locator.crashStr('battle'))
        return this.#_battle
    }

    get layers() {
        if (!this.#_layers) throw Error(Locator.crashStr('layers'))
        return this.#_layers
    }

    get items() {
        if (!this.#_items) throw Error(Locator.crashStr('items'))
        return this.#_items
    }

    get interaction() {
        if (!this.#_interaction) throw Error(Locator.crashStr('interaction'))
        return this.#_interaction
    }

    get input() {
        if (!this.#_input) throw Error(Locator.crashStr('input'))
        return this.#_input
    }

    get menu() {
        if (!this.#_menu) throw Error(Locator.crashStr('menu'))
        return this.#_menu
    }

    get upgrade() {
        if (!this.#_upgrade) throw Error(Locator.crashStr('upgrade'))
        return this.#_upgrade
    }

    get negotiations() {
        if (!this.#_negotiations) throw Error(Locator.crashStr('negotiations'))
        return this.#_negotiations
    }

    get camera() {
        if (!this.#_camera) throw Error(Locator.crashStr('camera'))
        return this.#_camera
    }

    get settings() {
        if (!this.#_settings) throw Error(Locator.crashStr('settings'))
        return this.#_settings
    }

    get saves() {
        if (!this.#_saves) throw Error(Locator.crashStr('saves'))
        return this.#_saves
    }

    get texts() {
        if (!this.#_texts) throw Error(Locator.crashStr('texts'))
        return this.#_texts
    }
}

const o_ = new Locator();

// @ts-ignore
window.o_ = o_

export {o_}