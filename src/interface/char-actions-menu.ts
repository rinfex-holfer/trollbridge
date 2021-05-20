import {resoursePaths} from "../resourse-paths";
import {characters} from "../managers/characters";
import {lair} from "../managers/lair";
import {Container, GameText, Sprite} from "../managers/render";
import {colors} from "../constants";
import {eventBus, Evt} from "../event-bus";
import {Char} from "../char/Char";
import {getTroll} from "../managers/troll";

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
    resource: keyof typeof resoursePaths.images,
    text: string,
    onClick: (id: string) => void
    key: CharAction,
}

const buttonsTemplate: CharActionButtonTemplate[] = [
    {key: CharAction.RELEASE, text: 'Отпустить', resource: 'button_release', onClick: (id: string) => characters.releaseChar(id)},
    {key: CharAction.ROB, text: 'Отобрать плату', resource: 'button_rob', onClick: (id: string) => characters.makeCharPay(id)},
    {key: CharAction.TAKE_ALL, text: 'Отобрать все', resource: 'button_rob', onClick: (id: string) => characters.makeCharGiveAll(id)},
    {key: CharAction.IMPRISON, text: 'Сделать пленником', resource: 'button_imprison', onClick: (id: string) => characters.makeImprisoned(id)},
    {key: CharAction.KILL, text: 'Убить', resource: 'button_kill', onClick: (id: string) => characters.killChar(id)},
    {key: CharAction.DEVOUR, text: 'Сожрать', resource: 'button_devour', onClick: (id: string) => getTroll().devour(id)},
    {key: CharAction.FEED, text: 'Накормить', resource: 'button_feed', onClick: (id: string) => lair.feedChar(id)},
    {key: CharAction.MAKE_FOOD, text: 'Сварить', resource: 'button_make_food', onClick: (id: string) => lair.makeFoodFrom(id)},

    {key: CharAction.BATTLE_DEVOUR, text: 'Сожрать', resource: 'button_devour', onClick: (id: string) => {
        getTroll().devour(id);
        eventBus.emit(Evt.TROLL_TURN_END);
    }},
    {key: CharAction.BATTLE_HIT, text: 'Ударить', resource: 'button_kill', onClick: (id: string) => {
        characters.hitChar(id, getTroll().rollDmg());
        eventBus.emit(Evt.TROLL_TURN_END);
    }},
]

const BUTTON_WIDTH = 32;
const BUTTON_MARGIN = 10;

const getButtonsRowWidth = (amount: number) => amount * BUTTON_WIDTH + (amount - 1) * BUTTON_MARGIN;

export class CharActionsMenu {
    buttons: {action: CharAction, sprite: Sprite, active: boolean}[] = []
    container: Container
    isShown = true;

    text: GameText

    constructor(private char: Char) {
        this.container = new Container(0, -50, {parent: this.char.container});
        // this.container.zIndex = zLayers.GAME_OBJECTS_MIN

        this.text = new GameText('', 0, -BUTTON_WIDTH/2, {color: colors.WHITE}, {parent: this.container})
        // this.text.anchor.set(0.5);

        buttonsTemplate.forEach((template, idx) => {
            const sprite = new Sprite(template.resource, 0, 0, {width: BUTTON_WIDTH, height: BUTTON_WIDTH, parent: this.container})
            sprite.setInteractive(true, {cursor: 'pointer'})
            sprite.onPointerOver(() => {
                this.showText(template.text)
            })
            sprite.onPointerOut(() => this.hideText())
            sprite.onClick(() => {
                template.onClick(this.char.id)
                this.hideText();
            });

            this.buttons.push({active: false, action: template.key, sprite: sprite});
        })

        this.char.container.onPointerOver(() => this.show())
        this.char.container.onPointerOut(() => this.hide())

        this.changeActiveButtons([]);
        this.hide();
    }

    showText(text: string) {
        this.text.setText(text);
    }

    hideText() {
        this.text.setText('');
    }

    changeActiveButtons(activeButtons: CharAction[]) {
        const fullWidth = getButtonsRowWidth(activeButtons.length);
        let x = -fullWidth / 2
        this.buttons.forEach(b => {
            const isActive = activeButtons.includes(b.action)
            b.active = isActive;
            b.sprite.setVisibility(isActive)
            b.sprite.setInteractive(isActive)

            if (isActive) {
                b.sprite.move(x, b.sprite.y);
                x += BUTTON_WIDTH + BUTTON_MARGIN
            }
        })

        // const cont = render.getContainer(this.containerId);
        // const width = getButtonsRowWidth(activeButtons.length) + BUTTON_WIDTH * 2
        // cont.hitArea = new PIXI.Rectangle(-width/2, -BUTTON_WIDTH, width, BUTTON_WIDTH * 3);

        // this.checkIsHovered();
    }

    show() {
        this.container.setVisibility(true);
        this.isShown = true;
    }

    hide() {
        this.container.setVisibility(false);
        this.isShown = false;
    }

    checkIsHovered() {
        // if (render.getIsHovered(this.parentContainer)) {
        //     this.show();
        // }
    }
}