import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as PIXI from 'pixi.js';
import {DateTime} from "./interface/date-time";
import {WaitButton} from "./interface/wait-button";
import {Troll} from "./interface/troll";
import {Resources} from "./interface/resourses";
import {GameOver} from "./interface/game-over";
import {render} from "./managers/render";
import {resoursePaths} from "./resourse-paths";
import {trollManager} from "./managers/troll-manager";
import {lair} from "./managers/lair";
import {bridgeManager} from "./managers/bridge-manager";
import {charManager} from "./managers/char-manager";
import {negotiations} from "./managers/negotiations";
import translations from "./translations";
negotiations;
translations;

const appElement = document.createElement('app');
appElement.id = 'app';
document.body.appendChild(appElement);

const App = () => {
    return <div id='temp-interface'>
        <GameOver />
        <DateTime />
        <Troll />
        <Resources />
    </div>;
};

ReactDOM.render(
    <App />,
    appElement
);

new Promise(res => {
    PIXI.Loader.shared
        .add(Object.values(resoursePaths.atlases))
        .add(Object.values(resoursePaths.images))
        .add(Object.values(resoursePaths.music))
        .add(Object.values(resoursePaths.sounds))
        // .add('game-config.json')
        .load(loader => console.log(loader.progress))
        .onComplete.add(res)
}).then(() => {
    console.log('LOADED');


    const update = (lag: number) => {
        const dt = (1000 / 60) + lag;

        charManager.update(dt);

        // @ts-ignore
        // PIXI.tweenManager.update(dt);
    }

    render.init(update);

    bridgeManager.init()
    lair.init()
    trollManager.initTroll()
})