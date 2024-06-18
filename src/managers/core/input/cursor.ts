import {ImageKey} from "../../../utils/utils-types";
import {resoursePaths} from "../../../resourse-paths";

export enum CursorType {
    DEFAULT = 'default',
    POINTER = 'pointer',
    BUILD = 'build',
    ATTACK = 'attack',
    NOT_ALLOWED = 'not_allowed',
    WAIT = 'wait',
    SLEEP = 'sleep',
}

export const CursorImgMap: Record<CursorType, ImageKey> = {
    [CursorType.DEFAULT]: "cursor_default",
    [CursorType.POINTER]: "cursor_default",
    [CursorType.BUILD]: "cursor_build",
    [CursorType.ATTACK]: "cursor_attack",
    [CursorType.NOT_ALLOWED]: "cursor_not_allowed",
    [CursorType.WAIT]: "cursor_wait",
    [CursorType.SLEEP]: "cursor_sleep",
} as const


export const getCursorStyle = (type: CursorType) => {
    if (type === CursorType.DEFAULT) {
        return 'default'
    }
    return `url('${resoursePaths.images[CursorImgMap[type]]}'),auto`;
}