import {resoursePaths} from "../resourse-paths";

export type ImageKey = keyof typeof resoursePaths.images;
export type AtlasKey = keyof typeof resoursePaths.atlases;

export type DmgOptions = {
    stun?: number
    grabbed?: boolean
}