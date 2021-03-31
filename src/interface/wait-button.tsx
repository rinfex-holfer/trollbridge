import React from "react";
import {timeManager} from "../game/time";

export const WaitButton = () => {
    return <button type='button' onClick={timeManager.wait}>
        ждать
    </button>
}