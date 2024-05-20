import {newGame} from "./new-game";
import translations from "./translations";
import './styles.css'
import {createReactUi} from "./interface/html/react-ui";

translations

declare global {
    interface Window {
        game: Phaser.Game
    }
}

if (window.game) {
    // console.log(window.game)
    window.game.destroy(true)
}

window.game = newGame();

createReactUi()
