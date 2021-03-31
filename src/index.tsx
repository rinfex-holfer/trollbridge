import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {eventBus, Evt} from "./event-bus";
import {battle} from "./game/battle";
import {DateTime} from "./interface/date-time";
import {WaitButton} from "./interface/wait-button";
import {Troll} from "./interface/troll";
import {Resources} from "./interface/resourses";
import {GameOver} from "./interface/game-over";
import {PassingBy} from "./interface/passing-by";
import {Negotiations} from "./interface/negotiations";

import {resourseManager} from "./game/resourses";
resourseManager;

const appElement = document.createElement('app');
appElement.id = 'app';
document.body.appendChild(appElement);

const App = () => {
    return <div>
        <GameOver />
        <DateTime />
        <WaitButton />
        <Troll />
        <Resources />
        <PassingBy />
        <Negotiations />
    </div>;
};

ReactDOM.render(
    <App />,
    appElement
);

eventBus.on(Evt.BATTLE_STARTED, battle)