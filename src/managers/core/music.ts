import {o_} from "../locator";
import {eventBus, Evt} from "../../event-bus";
import {MUSIC_KEY} from "./audio";
import {getRndItem} from "../../utils/utils-math";

const evtToMusic = [
    [Evt.GAME_OVER, MUSIC_KEY.GAMEOVER],
    [Evt.BATTLE_STARTED, [MUSIC_KEY.BATTLE_STARTED_0, MUSIC_KEY.BATTLE_STARTED_1]],
    [Evt.BATTLE_WON, [MUSIC_KEY.BATTLE_WON_0, MUSIC_KEY.BATTLE_WON_1]],
    [Evt.ENCOUNTER_STARTED, [MUSIC_KEY.TIME_PASSED_0, MUSIC_KEY.TIME_PASSED_1, MUSIC_KEY.TIME_PASSED_2]],
] as [Evt, MUSIC_KEY | MUSIC_KEY[]][]

export class MusicManager {
    constructor() {
        o_.register.music(this)

        evtToMusic.forEach(([evt, key]) => {
            eventBus.on(evt, () => {
                this.play(Array.isArray(key) ? getRndItem(key) : key)
            })
        })
    }

    play(key: MUSIC_KEY) {
        o_.audio.playMusic(key)
    }
}