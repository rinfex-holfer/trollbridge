import {resoursePaths} from "../resourse-paths";
import {colors, colorsCSS} from "../constants";
import {eventBus, Evt} from "../event-bus";
import {Char} from "../entities/char/Char";
import {o_} from "../managers/locator";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Container} from "../managers/core/render/container";
import {O_Text} from "../managers/core/render/text";
import {ResourceKey} from "../types";

export const enum CharAction {
    RELEASE = 'RELEASE',
    ROB = 'ROB',
    TAKE_ALL = 'TAKE_ALL',
    // IMPRISON = 'IMPRISON',
    KILL = 'KILL',
    // DEVOUR = 'DEVOUR',

    MAKE_FOOD = 'MAKE_FOOD',
    FEED = 'FEED',

    BATTLE_HIT = 'BATTLE_HIT',
    BATTLE_DEVOUR = 'BATTLE_DEVOUR',
    BATTLE_THROW_ROCK = 'BATTLE_THROW_ROCK',
    BATTLE_THROW_CHAR = 'BATTLE_THROW_CHAR',
}

type CharActionButtonTemplate = {
    resource: keyof typeof resoursePaths.images,
    text: string,
    onClick: (id: string) => void
    checkActive?: (char: Char) => boolean
    key: CharAction,
}

const buttonsTemplate: CharActionButtonTemplate[] = [
    {key: CharAction.RELEASE, text: 'Отпустить', resource: 'button_release', onClick: (id: string) => o_.characters.releaseChar(id)},

    {key: CharAction.ROB, text: 'Отобрать плату', resource: 'button_rob', onClick: (id: string) => o_.characters.makeCharPay(id),
        checkActive: char => char.gold > Math.ceil(char.goldInitial * 0.67)
    },

    {key: CharAction.TAKE_ALL, text: 'Отобрать все', resource: 'button_rob', onClick: (id: string) => o_.characters.makeCharGiveAll(id),
        checkActive: char => char.gold > 0 || char.food > 0
    },

    // {key: CharAction.IMPRISON, text: 'Сделать пленником', resource: 'button_imprison', onClick: (id: string) => o_.characters.makeImprisoned(id)},
    {key: CharAction.KILL, text: 'Убить', resource: 'button_kill', onClick: (id: string) => o_.characters.killChar(id)},

    // {key: CharAction.DEVOUR, text: 'Сожрать', resource: 'button_devour', onClick: (id: string) => o_.troll.devour(id)},
    {key: CharAction.FEED, text: 'Накормить', resource: 'button_feed', onClick: (id: string) => o_.lair.feedChar(id)},

    {key: CharAction.MAKE_FOOD, text: 'Разорвать', resource: 'button_make_food', onClick: (id: string) => o_.characters.transformToFood(id)},

    {key: CharAction.BATTLE_DEVOUR, text: 'Сожрать', resource: 'button_devour', onClick: (id: string) => {
        o_.troll.devour(id)
        eventBus.emit(Evt.TROLL_TURN_END)
    }},

    {key: CharAction.BATTLE_HIT, text: 'Ударить', resource: 'button_strike', onClick: (id: string) => o_.battle.trollGoAttack(id)},

    {key: CharAction.BATTLE_THROW_CHAR, text: 'Бросить об землю', resource: 'button_throw_char', onClick: (id: string) => o_.battle.trollGoThrowChar(id)},

    {key: CharAction.BATTLE_THROW_ROCK, text: 'Бросить камень', resource: 'button_throw_rock', onClick: (id: string) => o_.battle.trollThrowRock(id)},
]

const BUTTON_WIDTH = 32;
const BUTTON_MARGIN = 10;

const getButtonsRowWidth = (amount: number) => amount * BUTTON_WIDTH + (amount - 1) * BUTTON_MARGIN;

export class CharActionsMenu {
    buttons: {action: CharAction, sprite: O_Sprite, active: boolean, checkActive?: (char: Char) => boolean}[] = []
    activeButtons: CharAction[] = []
    container: O_Container
    isShown = true;

    text: O_Text

    constructor(private char: Char) {
        this.container = o_.render.createContainer(50, -25, {parent: this.char.container});
        // this.container.zIndex = zLayers.GAME_OBJECTS_MIN

        this.text =  o_.render.createText('', 0, 0, {color: colorsCSS.WHITE}, {parent: this.container})
        this.text.setOrigin(0.5, 1);

        buttonsTemplate.forEach((template, idx) => {
            const sprite =  o_.render.createSprite(template.resource, 0, -this.text.height-10, {width: BUTTON_WIDTH, height: BUTTON_WIDTH, parent: this.container})
            sprite.setInteractive(true, {cursor: 'pointer'})
            sprite.onPointerOver(() => {
                this.showText(template.text)
            })
            sprite.onPointerOut(() => this.hideText())
            sprite.onClick(() => {
                template.onClick(this.char.id)
                this.hideText()
            });
            sprite.setOrigin(0, 1);

            this.buttons.push({active: false, action: template.key, sprite: sprite, checkActive: template.checkActive});
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
        console.log('changeActiveButtons', activeButtons)
        this.activeButtons = activeButtons
        this.updateButtons()
    }

    updateButtons() {
        const fullWidth = getButtonsRowWidth(this.activeButtons.length);
        let x = 0
        this.buttons.forEach(b => {
            const isActive = this.activeButtons.includes(b.action) && (!b.checkActive || b.checkActive(this.char))
            b.active = isActive;
            b.sprite.setVisibility(isActive)
            b.sprite.setInteractive(isActive)

            if (isActive) {
                b.sprite.x = x;
                x += BUTTON_WIDTH + BUTTON_MARGIN
            }
        })
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