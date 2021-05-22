import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import {DateTime} from "./interface/date-time";
// import {Troll} from "./interface/troll";
// import {GameOver} from "./interface/game-over";
// import {render} from "./managers/render";
import {resoursePaths} from "./resourse-paths";
import {newGame} from "./game";
// import {trollManager} from "./managers/troll-manager";
// import {lair} from "./managers/lair";
// import {bridgeManager} from "./managers/bridge-manager";
// import {characters} from "./managers/characters";
// import {negotiations} from "./managers/negotiations";
import translations from "./translations";
// import {Environment} from "./managers/environment";
// import {audioManager} from "./managers/audio";
// import {particleManager} from "./managers/particles";

translations

const appElement = document.createElement('app');
appElement.id = 'app';
document.body.appendChild(appElement);

const App = () => {
    return <div id='temp-interface'>
        {/*<GameOver />*/}
        {/*<DateTime />*/}
        {/*<Troll />*/}
    </div>;
};

ReactDOM.render(
    <App />,
    appElement
);

declare global {
    interface Window {
        game: Phaser.Game
    }
}

window.game = newGame();

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