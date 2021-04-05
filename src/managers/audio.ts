import PixiSound from 'pixi-sound';
import {resoursePaths} from "../resourse-paths";

type AudioType = 'sound' | 'music';

export enum MUSIC_KEY {
    GAMEPLAY_MUSIC,
}

export enum SOUND_KEY {
    HIT,
    BLOCK,
    TORN
}

interface AudioOptions {
    key: SOUND_KEY | MUSIC_KEY;
    src: string;
    volume: number;
    loop?: boolean;
}

const sounds: AudioOptions[] = [
    {key: SOUND_KEY.HIT, src: resoursePaths.sounds.hitByTroll, volume: 0.1, loop: false},
    {key: SOUND_KEY.BLOCK, src: resoursePaths.sounds.block, volume: 0.2, loop: false},
    {key: SOUND_KEY.TORN, src: resoursePaths.sounds.torn, volume: 0.02, loop: false},
];

const music: AudioOptions[] = [
    {key: MUSIC_KEY.GAMEPLAY_MUSIC, src: resoursePaths.music.gameplay_music, volume: 1, loop: true},
];

type AudioRecord<K extends keyof any, T> = {
    [P in K]?: T;
};
type SoundsRecord = AudioRecord<SOUND_KEY, any>
type MusicRecord = AudioRecord<MUSIC_KEY, any>

class AudioManager {
    soundVolume = 1;
    musicVolume = 1;

    sounds: SoundsRecord = {};
    music: MusicRecord = {};

    createSounds() {
        sounds.forEach(options => {
            this.sounds[options.key] = PixiSound.Sound.from({url: options.src, loop: options.loop});
            this.sounds[options.key].volume = options.volume
        });

        music.forEach(options => {
            // @ts-ignore
            this.music[options.key] = PixiSound.Sound.from({url: options.src, loop: options.loop});
        });


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
        PixiSound.stopAll();
    }

    setMusicVolume(val: number) {
        // setMusicVolume(val);
        Object.values(this.music).forEach(m => m.volume = Math.min(val / 100, 1));
    }

    setSoundVolume(val: number) {
        // setSoundVolume(val);
        Object.values(this.sounds).forEach(m => m.volume = Math.min(val / 100, 1));
    }
}

export const audioManager = new AudioManager();