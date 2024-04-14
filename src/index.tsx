import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {GameOver} from "./interface/game-over";
import {newGame} from "./game";
import translations from "./translations";
import {GameWin} from "./interface/game-win";
import {HowToPlay} from "./interface/how-to-play";
import './styles.css'
import {SettingsMenu} from "./interface/settings-menu";
import {createRoot} from "react-dom/client";

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
        <GameOver/>
        <GameWin/>
        <HowToPlay/>
        <SettingsMenu/>
        {/*<DateTime />*/}
    </div>;
};

setTimeout(() => {
    const root = createRoot(appElement);
    root.render(<App/>);
}, 2000)