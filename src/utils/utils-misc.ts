import {o_} from "../managers/locator";
import {getMax} from "./utils-math";

export const getGameSize = () => {
    const [width, height] = o_.settings.getResolution()

    return {
        height,
        width
    };
};

const ids = {} as { [entityType: string]: number };

export function createId(key: string): string {
    if (ids[key] === undefined) ids[key] = -1;

    ids[key] = ids[key] + 1;
    return key + '_' + ids[key];
}

export const dumbClone = (obj: any) => JSON.parse(JSON.stringify(obj));

export const stub = () => void 0;

export function findAndSplice<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item)

    if (index === -1) return false

    arr.splice(index, 1)
    return true
}

export function debugExpose(fn: Function, key: string) {
    // @ts-ignore
    if (!window.gameDebug) {
        // @ts-ignore
        window.gameDebug = {}
    }
    // @ts-ignore
    window.gameDebug[key] = fn
}