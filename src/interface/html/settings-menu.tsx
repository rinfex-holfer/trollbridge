import React, {useEffect, useState, useSyncExternalStore} from "react";
import {eventBus, Evt} from "../../event-bus";
import {o_} from "../../managers/locator";
import {Resolution, resolutionMap, Settings} from "../../managers/core/settings";

const subscribe = (callback: VoidFunction) => {
    const id = eventBus.on(Evt.SETTINGS_CHANGED, callback)

    return () => {
        eventBus.unsubscribe(Evt.SETTINGS_CHANGED, id)
    }
};
const getSettings = () => {
    return o_.settings.getSettings()
}

export const SettingsMenu = () => {
    const [isHidden, setHidden] = useState(true);
    useEffect(() => {
        if (!isHidden) {
            // TODO
            // o_.interaction.disableEverything()
        } else {
            // TODO
            // o_.interaction.enableEverything()
        }
    }, [isHidden]);

    const settings = useSyncExternalStore<Settings>(subscribe, getSettings)

    const onNewResolutionSet = (newResolutionStr: Resolution) => {
        const [width, height] = resolutionMap[newResolutionStr];
        o_.game.getScene().scale.setGameSize(width, height);
        o_.settings.patchSettings({
            resolution: newResolutionStr
        });
    }

    return <div className='settings'>
        <button className='settings__open' onClick={(e) => {
            setHidden(!isHidden)
        }}>{isHidden ? '⚙️' : 'X'}</button>

        {!isHidden && <div className='settings__overlay'>
            <div className='settings__menu'>
                <select
                    value={settings.resolution}
                    name="resolution"
                    id="resolution-select"
                    onChange={e => {
                        onNewResolutionSet(e.target.value as Resolution)
                    }}
                >
                    {Object.keys(resolutionMap).map(rKey =>
                        <option value={rKey} key={rKey}>{rKey}</option>
                    )}
                </select>
            </div>
        </div>}
    </div>
}