import {resoursePaths} from "../resourse-paths";
import {characters} from "../managers/characters";
import {lair} from "../managers/lair";
import {ResourceKey} from "../types";
import {render} from "../managers/render";
import {trollManager} from "../managers/troll";
import {colors, zLayers} from "../constants";
import {Container, GameSprite, GameText} from "../type-aliases";
import {eventBus, Evt} from "../event-bus";

export const enum CharAction {
    RELEASE = 'RELEASE',
    ROB = 'ROB',
    TAKE_ALL = 'TAKE_ALL',
    IMPRISON = 'IMPRISON',
    KILL = 'KILL',
    DEVOUR = 'DEVOUR',

    MAKE_FOOD = 'MAKE_FOOD',
    FEED = 'FEED',

    BATTLE_HIT = 'BATTLE_HIT',
    BATTLE_DEVOUR = 'BATTLE_DEVOUR',
}

type CharActionButtonTemplate = {
    resource: string,
    text: string,
    onClick: (id: string) => void
    key: CharAction,
}

const buttonsTemplate: CharActionButtonTemplate[] = [
    {key: CharAction.RELEASE, text: 'Отпустить', resource: resoursePaths.images.button_release, onClick: (id: string) => characters.releaseChar(id)},
    {key: CharAction.ROB, text: 'Отобрать плату', resource: resoursePaths.images.button_rob, onClick: (id: string) => characters.makeCharPay(id)},
    {key: CharAction.TAKE_ALL, text: 'Отобрать все', resource: resoursePaths.images.button_rob, onClick: (id: string) => characters.makeCharGiveAll(id)},
    {key: CharAction.IMPRISON, text: 'Сделать пленником', resource: resoursePaths.images.button_imprison, onClick: (id: string) => characters.makeImprisoned(id)},
    {key: CharAction.KILL, text: 'Убить', resource: resoursePaths.images.button_kill, onClick: (id: string) => characters.killChar(id)},
    {key: CharAction.DEVOUR, text: 'Сожрать', resource: resoursePaths.images.button_devour, onClick: (id: string) => trollManager.devour(id)},
    {key: CharAction.FEED, text: 'Накормить', resource: resoursePaths.images.button_feed, onClick: (id: string) => lair.feedChar(id)},
    {key: CharAction.MAKE_FOOD, text: 'Сварить', resource: resoursePaths.images.button_make_food, onClick: (id: string) => lair.makeFoodFrom(id)},

    {key: CharAction.BATTLE_DEVOUR, text: 'Сожрать', resource: resoursePaths.images.button_devour, onClick: (id: string) => {
        trollManager.devour(id);
        eventBus.emit(Evt.TROLL_TURN_END);
    }},
    {key: CharAction.BATTLE_HIT, text: 'Ударить', resource: resoursePaths.images.button_kill, onClick: (id: string) => {
        characters.hitChar(id, trollManager.rollDmg());
        eventBus.emit(Evt.TROLL_TURN_END);
    }},
]

const BUTTON_WIDTH = 32;
const BUTTON_MARGIN = 10;

const getButtonsRowWidth = (amount: number) => amount * BUTTON_WIDTH + (amount - 1) * BUTTON_MARGIN;

export class CharActionsMenu {
    buttons: {action: CharAction, id: string, active: boolean}[] = []
    buttonSprites: GameSprite[] = []
    containerId: string
    container: Container
    parentContainer: Container
    isShown = true;

    text: GameText

    constructor(private charId: string) {

        this.containerId = charId + '_actions-menu';

        const buttonsContainer = render.createContainer(this.containerId, this.charId);
        this.container = buttonsContainer;
        this.container.zIndex = zLayers.GAME_OBJECTS_MIN

        render.move(this.containerId, 0, -50);

        this.text = render.createText('', 0, -BUTTON_WIDTH/2, {fill: colors.WHITE}, this.container)
        // this.text.anchor.set(0.5);

        buttonsTemplate.forEach((template, idx) => {
            const id = this.charId + '_' + template.key;
            this.buttons.push({id, active: false, action: template.key});
            const sprite = render.createSprite({
                entityId: id,
                path: template.resource,
                container: buttonsContainer,
                visible: true,
                x: 0,
                y: 0,
                width: BUTTON_WIDTH,
                height: BUTTON_WIDTH,
                // anchor: {x: 0.5, y: 0.5},
            })
            sprite.interactive = true;
            sprite.buttonMode = true;
            sprite.on('mouseover', () => {
                this.showText(template.text)
            })
            sprite.on('mouseout', () => this.hideText())
            sprite.addListener('click', () => {
                template.onClick(this.charId)
                this.hideText();
            });

            this.buttonSprites.push(sprite)
        })

        const parentContainer = render.getContainer(this.charId);
        parentContainer.on('mouseover', () => this.show())
        parentContainer.on('mouseout', () => this.hide())
        this.parentContainer = parentContainer;

        this.changeActiveButtons([]);
        this.hide();
    }

    showText(text: string) {
        this.text.text = text;
    }

    hideText() {
        this.text.text = '';
    }

    destroy() {
        this.buttons.forEach(b => {
            render.removeSprite(b.id);
        })

        render.destroyContainer(this.containerId);
    }

    changeActiveButtons(activeButtons: CharAction[]) {
        const fullWidth = getButtonsRowWidth(activeButtons.length);
        let x = -fullWidth / 2
        this.buttons.forEach(b => {
            const isActive = activeButtons.includes(b.action)
            b.active = isActive;
            render.changeSpriteVisibility(b.id, isActive)
            render.getSprite(b.id).interactive = isActive;

            if (isActive) {
                const buttonSprite = render.getSprite(b.id)
                render.moveSprite(b.id, x, buttonSprite.y)
                x += BUTTON_WIDTH + BUTTON_MARGIN
            }
        })

        const cont = render.getContainer(this.containerId);
        const width = getButtonsRowWidth(activeButtons.length) + BUTTON_WIDTH * 2
        // cont.hitArea = new PIXI.Rectangle(-width/2, -BUTTON_WIDTH, width, BUTTON_WIDTH * 3);

        this.checkIsHovered();
    }

    show() {
        render.changeContainerVisibility(this.containerId, true);
        this.isShown = true;
    }

    hide() {
        render.changeContainerVisibility(this.containerId, false);
        this.isShown = false;
    }

    checkIsHovered() {
        if (render.getIsHovered(this.parentContainer)) {
            this.show();
        }
    }
}