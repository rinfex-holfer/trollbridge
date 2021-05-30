import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
        {/*<DateTime />*/}
    </div>;
};

setTimeout(() => {
    ReactDOM.render(
        <App />,
        appElement
    );
}, 2000)