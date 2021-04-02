import {resoursePaths} from "../resourse-paths";
import {charManager} from "../managers/char-manager";
import {lair} from "../managers/lair";
import {ResourceKey} from "../types";
import {render} from "../managers/render";
import {trollManager} from "../managers/troll-manager";
import {zLayers} from "../constants";

export const enum CharAction {
    RELEASE = 'RELEASE',
    ROB = 'ROB',
    TAKE_ALL = 'TAKE_ALL',
    IMPRISON = 'IMPRISON',
    KILL = 'KILL',
    DEVOUR = 'DEVOUR',
    MAKE_FOOD = 'MAKE_FOOD',
    FEED = 'FEED',
}

type CharActionButtonTemplate = {
    resource: string,
    onClick: (id: string) => void
}

const buttons = {
    [CharAction.RELEASE]:   {resource: resoursePaths.images.button_release, onClick: (id: string) => charManager.releaseChar(id)},
    [CharAction.ROB]:       {resource: resoursePaths.images.button_rob, onClick: (id: string) => charManager.makeCharPay(id)},
    [CharAction.TAKE_ALL]:       {resource: resoursePaths.images.button_rob, onClick: (id: string) => charManager.makeCharGiveAll(id)},
    [CharAction.IMPRISON]:  {resource: resoursePaths.images.button_imprison, onClick: (id: string) => charManager.makeImprisoned(id)},
    [CharAction.KILL]:      {resource: resoursePaths.images.button_kill, onClick: (id: string) => charManager.killChar(id)},
    [CharAction.DEVOUR]:    {resource: resoursePaths.images.button_devour, onClick: (id: string) => trollManager.devour(id)},
    [CharAction.FEED]:    {resource: resoursePaths.images.button_feed, onClick: (id: string) => lair.feedChar(id)},
    [CharAction.MAKE_FOOD]: {resource: resoursePaths.images.button_make_food, onClick: (id: string) => lair.makeFoodFrom(id)},
} as {[key: string]: CharActionButtonTemplate}

export class CharActionsMenu {
    activeButtons = [] as CharAction[]

    constructor(private charId: string) {
        const charContainer = render.getContainer(this.charId);

        Object.keys(buttons)
            .forEach((key, idx) => {
                const buttonTemplate = buttons[key];
                const sprite = render.createSprite({
                    entityId: this.charId + '_' + key,
                    path: buttonTemplate.resource,
                    container: charContainer,
                    visible: false,
                    x: -70 + idx * 35,
                    y: -100,
                    width: 32,
                    height: 32
                })
                sprite.zIndex = zLayers.GAME_OBJECTS_MIN
                sprite.interactive = true;
                sprite.buttonMode = true;
                sprite.addListener('click', () => buttonTemplate.onClick(this.charId));
            })
    }

    destroy() {
        Object.keys(buttons)
            .forEach((key, idx) => {
                render.removeSprite(this.charId + '_' + key);
            });
    }

    changeActiveButtons(activeButtons: CharAction[]) {
        this.activeButtons = activeButtons;
    }

    show() {
        Object.keys(buttons)
            .forEach((key, idx) => {
                render.getSprite(this.charId + '_' + key).renderable = false;
            });

        this.activeButtons.forEach(key => {
            render.getSprite(this.charId + '_' + key).renderable = true;
        })
    }

    hide() {
        this.activeButtons.forEach(key => {
            render.getSprite(this.charId + '_' + key).renderable = false;
        })
    }
}