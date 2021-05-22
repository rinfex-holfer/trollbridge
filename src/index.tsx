import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DateTime} from "./interface/date-time";
import {Troll} from "./interface/troll";
import {GameOver} from "./interface/game-over";
import {newGame} from "./game";
import translations from "./translations";

translations



declare global {
    interface Window {
        game: Phaser.Game
    }
}

window.game = newGame();

const appElement = document.createElement('app');
appElement.id = 'app';
document.body.appendChild(appElement);

const App = () => {
    return <div id='temp-interface'>
        <GameOver />
        <DateTime />
        <Troll />
    </div>;
};

setTimeout(() => {
    ReactDOM.render(
        <App />,
        appElement
    );
}, 2000)


// new Promise(res => {
//     PIXI.Loader.shared
//         .add(Object.values(resoursePaths.atlases))
//         .add(Object.values(resoursePaths.images))
//         .add(Object.values(resoursePaths.music))
//         .add(Object.values(resoursePaths.sounds))
//         // .add('game-config.json')
//         .load(loader => console.log(loader.progress))
//         .onComplete.add(res)
// }).then(() => {
//     console.log('LOADED');
//
//
//     const update = (lag: number) => {
//         const dt = (1000 / 60) + lag;
//
//         characters.update(dt);
//         particleManager.update(dt);
//
//         // @ts-ignore
//         // PIXI.tweenManager.update(dt);
//     }
//
//     new Environment()
//
//     // audioManager.createSounds()
//     // audioManager.setSoundVolume(50)
//
//     render.init(update);
//
//     bridgeManager.init()
//     lair.init()
//     trollManager.initTroll()
//     characters.init();
// })