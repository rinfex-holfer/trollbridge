import {resoursePaths} from "../../resourse-paths";
import {o_} from "../locator";

type AudioType = 'sound' | 'music';

export const enum MUSIC_KEY {
    GAMEPLAY_MUSIC = 'GAMEPLAY_MUSIC',
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
];

const music: AudioOptions[] = [
    {key: MUSIC_KEY.GAMEPLAY_MUSIC, src: 'gameplay_music', volume: 1, loop: true},
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

    playMusic = (key: MUSIC_KEY) => {
        if (this.music[key]) {
            this.music[key].play();
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