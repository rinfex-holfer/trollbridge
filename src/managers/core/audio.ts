import {resoursePaths} from "../../resourse-paths";
import {o_} from "../locator";

type AudioType = 'sound' | 'music';

export const enum MUSIC_KEY {
    GAMEPLAY_MUSIC = 'GAMEPLAY_MUSIC',
    GAMEOVER = 'GAMEOVER',
    BATTLE_STARTED_0 = 'BATTLE_STARTED_0',
    BATTLE_STARTED_1 = 'BATTLE_STARTED_1',
    BATTLE_WON_0 = 'BATTLE_WON_0',
    BATTLE_WON_1 = 'BATTLE_WON_1',
    TIME_PASSED_0 = 'TIME_PASSED_0',
    TIME_PASSED_1 = 'TIME_PASSED_1',
    TIME_PASSED_2 = 'TIME_PASSED_2',
}

export const enum SOUND_KEY {
    HIT = 'HIT',
    BLOCK = 'BLOCK',
    TORN = 'TORN',
    PICK = 'PICK',
    PICK_BIG = 'PICK_BIG',
    PICK_THIN = 'PICK_THIN',
    CANCEL = 'CANCEL',
    COLLECT = 'COLLECT',
    BONK = 'BONK',
    BUBBLE = 'BUBBLE',
    CHEW = 'CHEW',
    EATING_0 = 'EATING_0',
    EATING_1 = 'EATING_1',
    EATING_2 = 'EATING_2',
    EATING_3 = 'EATING_3',

    LEVEL_UP = 'LEVEL_UP',
    UPGRADE = 'UPGRADE',

    TROLL_BREATHING_SLOW = 'TROLL_BREATHING_SLOW',
    TROLL_BREATHING = 'TROLL_BREATHING',
    TROLL_DEATH = 'TROLL_DEATH',
    TROLL_WOUNDED_0 = 'TROLL_WOUNDED_0',
    TROLL_WOUNDED_1 = 'TROLL_WOUNDED_1',
    TROLL_WOUNDED_2 = 'TROLL_WOUNDED_2',

    TROLL_BLOCK_0 = 'TROLL_BLOCK_0',
    TROLL_BLOCK_1 = 'TROLL_BLOCK_1',
    TROLL_BLOCK_2 = 'TROLL_BLOCK_2',

    TROLL_ATTACK_VOICE = 'TROLL_ATTACK_VOICE',

    TROLL_LAUGH_0 = 'TROLL_LAUGH_0',
    TROLL_LAUGH_HARD = 'TROLL_LAUGH_HARD',
    TROLL_LAUGH_MEDIUM = 'TROLL_LAUGH_MEDIUM',

    TROLL_HM = 'TROLL_HM',
    TROLL_OH = 'TROLL_OH',
    TROLL_HEY = 'TROLL_HEY',
}

interface AudioOptions {
    key: SOUND_KEY | MUSIC_KEY;
    src: keyof typeof resoursePaths.sounds | keyof typeof resoursePaths.music;
    volume: number;
    loop?: boolean;
}

const sounds: AudioOptions[] = [
    {key: SOUND_KEY.HIT, src: 'hitByTroll', volume: 0.1, loop: false},
    {key: SOUND_KEY.BLOCK, src: 'block', volume: 0.2, loop: false},
    {key: SOUND_KEY.TORN, src: 'torn', volume: 0.02, loop: false},
    {key: SOUND_KEY.PICK, src: 'pick', volume: 0.2, loop: false},
    {key: SOUND_KEY.PICK_BIG, src: 'pick_big', volume: 0.2, loop: false},
    {key: SOUND_KEY.PICK_THIN, src: 'pick_thin', volume: 0.2, loop: false},
    {key: SOUND_KEY.CANCEL, src: 'cancel', volume: 0.2, loop: false},
    {key: SOUND_KEY.COLLECT, src: 'collect', volume: 0.2, loop: false},
    {key: SOUND_KEY.BONK, src: 'bonk', volume: 0.2, loop: false},
    {key: SOUND_KEY.BUBBLE, src: 'bubble', volume: 0.2, loop: false},
    {key: SOUND_KEY.CHEW, src: 'chew', volume: 1, loop: false},

    {key: SOUND_KEY.EATING_0, src: 'eating_0', volume: 1, loop: false},
    {key: SOUND_KEY.EATING_1, src: 'eating_1', volume: 1, loop: false},
    {key: SOUND_KEY.EATING_2, src: 'eating_2', volume: 1, loop: false},
    {key: SOUND_KEY.EATING_3, src: 'eating_3', volume: 1, loop: false},

    {key: SOUND_KEY.LEVEL_UP, src: 'level_up', volume: 0.2, loop: false},
    {key: SOUND_KEY.UPGRADE, src: 'upgrade', volume: 0.2, loop: false},

    {key: SOUND_KEY.TROLL_BREATHING, src: 'troll_breathing', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_BREATHING_SLOW, src: 'troll_breathing_slow', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_DEATH, src: 'troll_death', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_WOUNDED_0, src: 'troll_wounded_0', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_WOUNDED_1, src: 'troll_wounded_1', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_WOUNDED_2, src: 'troll_wounded_2', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_BLOCK_0, src: 'troll_block_0', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_BLOCK_1, src: 'troll_block_1', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_BLOCK_2, src: 'troll_block_2', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_ATTACK_VOICE, src: 'troll_attack_voice', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_LAUGH_0, src: 'troll_laugh_0', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_LAUGH_HARD, src: 'troll_laugh_hard', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_LAUGH_MEDIUM, src: 'troll_laugh_medium', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_HM, src: 'troll_hm', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_OH, src: 'troll_oh', volume: 0.2, loop: false},
    {key: SOUND_KEY.TROLL_HEY, src: 'troll_hey', volume: 0.2, loop: false},
];

const music: AudioOptions[] = [
    {key: MUSIC_KEY.GAMEPLAY_MUSIC, src: 'gameplay_music', volume: 0.1, loop: true},
    {key: MUSIC_KEY.GAMEOVER, src: 'gameover', volume: 0.1, loop: false},
    {key: MUSIC_KEY.BATTLE_STARTED_0, src: 'combat_started_0', volume: 0.1, loop: false},
    {key: MUSIC_KEY.BATTLE_STARTED_1, src: 'combat_started_1', volume: 0.1, loop: false},
    {key: MUSIC_KEY.BATTLE_WON_0, src: 'combat_won_0', volume: 0.1, loop: false},
    {key: MUSIC_KEY.BATTLE_WON_1, src: 'combat_won_1', volume: 0.1, loop: false},
    {key: MUSIC_KEY.TIME_PASSED_0, src: 'time_passed_0', volume: 0.1, loop: false},
    {key: MUSIC_KEY.TIME_PASSED_1, src: 'time_passed_1', volume: 0.1, loop: false},
    {key: MUSIC_KEY.TIME_PASSED_2, src: 'time_passed_2', volume: 0.1, loop: false},
];

type AudioRecord<K extends keyof any, T> = {
    [P in K]?: T;
};
type SoundsRecord = AudioRecord<SOUND_KEY, any>
type MusicRecord = AudioRecord<MUSIC_KEY, any>

export class AudioManager {
    soundVolume = 1;
    musicVolume = 1;

    sounds: {[soundKey: string]: Phaser.Sound.BaseSound} = {};
    music: {[musicKey: string]: Phaser.Sound.BaseSound} = {};

    scene: Phaser.Scene

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        sounds.forEach(options => {
            this.sounds[options.key] = scene.sound.add(options.src, {loop: options.loop, volume: options.volume});
        });

        music.forEach(options => {
            this.music[options.key] = scene.sound.add(options.src, {loop: options.loop, volume: options.volume});
        });

        o_.register.audio(this);
        // this.playMusic(MUSIC_KEY.GAMEPLAY_MUSIC);
    }

    playSound = (key: SOUND_KEY) => {
        if (this.sounds[key]) {
            this.sounds[key].play();
        }
    };

    playingCurrently: MUSIC_KEY | undefined
    playMusic = (key: MUSIC_KEY) => {
        // console.trace('playMusic', key)
        if (this.playingCurrently && this.music[this.playingCurrently].isPlaying)
            this.music[this.playingCurrently].stop()

        if (!this.music[key].isPlaying) {
            this.music[key].play();
            this.playingCurrently = key
        }
    };

    stopSound = (soundKey: SOUND_KEY) => {
        if (this.sounds[soundKey]) {
            this.sounds[soundKey].stop();
        }
    }

    stopMusic = (key: MUSIC_KEY) => {
        if (this.music[key]) {
            this.music[key].stop();
        }
    }

    stopAll = () => {
        // PixiSound.stopAll();
    }

    setMusicVolume(val: number) {
        // setMusicVolume(val);
        // Object.values(this.music).forEach(m => m. = Math.min(val / 100, 1));
    }

    setSoundVolume(val: number) {
        // setSoundVolume(val);
        // Object.values(this.sounds).forEach(m => m.volume = Math.min(val / 100, 1));
    }
}