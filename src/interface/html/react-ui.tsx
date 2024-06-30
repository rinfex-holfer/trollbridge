import {Menu} from "./menu";
import {LoadingScreen} from "./loading-screen";
import {createRoot} from "react-dom/client";
import * as React from "react";
import {useState} from "react";
import {BuildPanel, BuildPanelProps, defaultBuildPanelProps} from "./build-panel";

const appElement = document.createElement('app');
appElement.id = 'app';
document.getElementById('wrapper')!.appendChild(appElement);

export const reactUiRef = {
    setIsReady: (val: boolean) => void 0,
    setBuildPanel: () => void 0
} as {
    setIsReady: (val: boolean) => void,
    setBuildPanel: (props: Partial<BuildPanelProps>) => void,
}

const App = () => {
    const [ready, setIsReady] = useState(false)
    const [buildPanelProps, setBuildPanelProps] = useState<BuildPanelProps>(defaultBuildPanelProps)

    reactUiRef.setIsReady = (val: boolean) => setIsReady(val)
    reactUiRef.setBuildPanel = (props) => setBuildPanelProps(oldProps => ({
        ...oldProps,
        ...props
    }))

    return <div>
        <LoadingScreen/>
        {ready ? <Menu/> : null}
        {/*<BuildPanel {...buildPanelProps} />*/}
    </div>;
};

export const createReactUi = () => {
    const root = createRoot(appElement);
    root.render(<App/>);
}