import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
import {createPromiseAndHandlers} from "./utils/utils-async";

const load = (scene: Phaser.Scene): Promise<any> => {
    const {promise, done, fail} = createPromiseAndHandlers();

    scene.load.on('progress', (a: string) => console.log(a));
    scene.load.on('complete', done);
    scene.load.on('loaderror', fail);

    const imgKeys = Object.keys(resoursePaths.images) as (keyof typeof resoursePaths.images)[];
    const atlasesKeys = Object.keys(resoursePaths.atlases) as (keyof typeof resoursePaths.atlases)[];
    const musicKeys = Object.keys(resoursePaths.music) as (keyof typeof resoursePaths.music)[];
    const soundKeys = Object.keys(resoursePaths.sounds) as (keyof typeof resoursePaths.sounds)[];

    imgKeys.forEach(key => scene.load.image(key, resoursePaths.images[key]))
    atlasesKeys.forEach(key => {
        scene.load.atlas(key, resoursePaths.atlases[key].replace('.json', '.png'), resoursePaths.atlases[key])
    })
    musicKeys.forEach(key => scene.load.audio(key, resoursePaths.music[key]))
    soundKeys.forEach(key => scene.load.audio(key, resoursePaths.sounds[key]))

    return promise;
}

export const resourseLoader = {
    load
}