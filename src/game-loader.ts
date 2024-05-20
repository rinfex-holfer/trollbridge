import Phaser from "phaser";
import {createPromiseAndHandlers} from "./utils/utils-async";
import {resoursePaths} from "./resourse-paths";
import {eventBus, Evt} from "./event-bus";

export class GameLoader {
    constructor(private scene: Phaser.Scene) {

    }

    load = (): Promise<any> => {
        eventBus.emit(Evt.GAME_LOADING_STARTED)

        const {promise, done, fail} = createPromiseAndHandlers();

        
        this.scene.load.on('progress', (a: string) => {
            eventBus.emit(Evt.GAME_LOADING_PROGRESS, +a * 100)
        });
        this.scene.load.on('complete', () => {
            done()
            eventBus.emit(Evt.GAME_LOADING_FINISHED)
        });
        this.scene.load.on('loaderror', (e: any) => {
            console.error(e)
            fail()
            eventBus.emit(Evt.GAME_LOADING_FINISHED)
        });

        const imgKeys = Object.keys(resoursePaths.images) as (keyof typeof resoursePaths.images)[];
        const atlasesKeys = Object.keys(resoursePaths.atlases) as (keyof typeof resoursePaths.atlases)[];
        const musicKeys = Object.keys(resoursePaths.music) as (keyof typeof resoursePaths.music)[];
        const soundKeys = Object.keys(resoursePaths.sounds) as (keyof typeof resoursePaths.sounds)[];

        imgKeys.forEach(key => this.scene.load.image(key, resoursePaths.images[key]))
        atlasesKeys.forEach(key => {
            const jsonUrl = resoursePaths.atlases[key]
            const pngUrl = jsonUrl.replace('.json', '.png');
            this.scene.load.atlas(key, pngUrl, jsonUrl)
        })
        musicKeys.forEach(key => this.scene.load.audio(key, resoursePaths.music[key]))
        soundKeys.forEach(key => this.scene.load.audio(key, resoursePaths.sounds[key]))

        return promise;
    }
}