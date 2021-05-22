import {RenderManager} from "./core/render/render-manager";
import {CharactersManager} from "./game/characters";
import {BridgeManager} from "./game/bridge";
import {Lair} from "./game/lair";
import {Troll} from "./game/troll";
import {AudioManager} from "./core/audio";
import {TimeManager} from "./core/time";
import {GameManager} from "./game/game-manager";
import {BattleManager} from "./game/battle";
import {LayersManager} from "./core/layers";

class Locator {
    #_render: RenderManager | undefined
    #_characters: CharactersManager | undefined
    #_bridge: BridgeManager | undefined
    #_lair: Lair | undefined
    #_troll: Troll | undefined
    #_audio: AudioManager | undefined
    #_time: TimeManager | undefined
    #_game: GameManager | undefined
    #_battle: BattleManager | undefined
    #_layers: LayersManager | undefined

    static crashStr(m: string) {
        return 'trying access ' + m + ' before it was created';
    }

    register = {
        render: (render: RenderManager) => { this.#_render = render },
        characters: (characters: CharactersManager) => { this.#_characters = characters },
        bridge: (bridge: BridgeManager) => { this.#_bridge = bridge },
        lair: (lair: Lair) => { this.#_lair = lair },
        troll: (troll: Troll) => { this.#_troll = troll },
        audio: (audio: AudioManager) => { this.#_audio = audio },
        time: (time: TimeManager) => { this.#_time = time },
        game: (game: GameManager) => { this.#_game = game },
        battle: (battle: BattleManager) => { this.#_battle = battle },
        layers: (layers: LayersManager) => { this.#_layers = layers },
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
}

export const o_ = new Locator();