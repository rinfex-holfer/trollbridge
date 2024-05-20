import {Menu} from "./menu";
import {LoadingScreen} from "./loading-screen";
import {createRoot} from "react-dom/client";
import * as React from "react";
import {useState} from "react";

const appElement = document.createElement('app');
appElement.id = 'app';
document.body.appendChild(appElement);

export const reactUiRef = {
    setIsReady: (val: boolean) => void 0
} as {
    setIsReady: (val: boolean) => void
}

const App = () => {
    const [ready, setIsReady] = useState(false)

    reactUiRef.setIsReady = (val: boolean) => setIsReady(val)

    return <div>
        <LoadingScreen/>
        {ready ? <Menu/> : null}
    </div>;
};

export const createReactUi = () => {
    const root = createRoot(appElement);
    root.render(<App/>);
}