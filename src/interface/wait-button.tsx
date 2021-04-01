import React from "react";
import {timeManager} from "../managers/time-manager";

export const WaitButton = () => {
    return <button type='button' onClick={timeManager.wait}>
        ждать
    </button>
}