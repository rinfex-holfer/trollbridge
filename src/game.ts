import Phaser from "phaser";
import {resoursePaths} from "./resourse-paths";
import {resourseLoader} from "./resource-loader";
import {AnimatedSprite, render, Sprite} from "./managers/render";
// negotiations;
// translations;
//
var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: function() {
            resourseLoader.load(this)
            preload(this);
        },
        create: function() {
            create(this);
        }
    }
};

const preload = (scene: Phaser.Scene) => {
    const imgKeys = Object.keys(resoursePaths.images) as (keyof typeof resoursePaths.images)[];
    imgKeys.forEach(key => scene.load.image(key, resoursePaths.images[key]))
}

const create = (scene: Phaser.Scene) => {
    render.init(scene);
    new Sprite('background', 0, 0);
    const s = new AnimatedSprite({key: 'troll', animations: [{key: 'idle'}, {key: 'walk', repeat: -1, frameRate: 24}], x: 100, y: 100});
    s.play('walk');
}

export const newGame = () => new Phaser.Game(config);

