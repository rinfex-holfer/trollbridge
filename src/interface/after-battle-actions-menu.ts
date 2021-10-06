import {o_} from "../managers/locator";
import {AfterBattleAction} from "./char-actions-menu";
import {resoursePaths} from "../resourse-paths";
import {Char} from "../entities/char/char";
import {colorsCSS} from "../configs/constants";
import {positioner} from "../managers/game/positioner";
import {O_Container} from "../managers/core/render/container";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";
import {onEncounterEnd} from "../helpers";

type AfterBattleActionSpec = {
    action: AfterBattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: (char: Char) => void
    getIsActive: (char: Char) => boolean
}

const actionSpecs: {[action in AfterBattleAction]: AfterBattleActionSpec} = {
    [AfterBattleAction.RELEASE]: {
        action: AfterBattleAction.RELEASE,
        text: 'Отпустить',
        resource: 'button_release',
        execute: char => o_.characters.releaseChar(char),
        getIsActive: char => true
    },

    [AfterBattleAction.ROB]: {
        action: AfterBattleAction.ROB,
        text: 'Отобрать плату',
        resource: 'button_rob',
        execute: char => {
            o_.characters.makeCharPay(char)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => !char.isRobbed
    },

    [AfterBattleAction.TAKE_ALL]: {
        action: AfterBattleAction.TAKE_ALL,
        text: 'Отобрать все',
        resource: 'button_rob',
        execute: char => {
            o_.characters.makeCharGiveAll(char)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => char.gold > 0 || char.food > 0
    },

    [AfterBattleAction.MAKE_FOOD]: {
        action: AfterBattleAction.MAKE_FOOD,
        text: 'Разорвать',
        resource: 'button_make_food',
        execute: char => o_.characters.transformToFood(char) ,
        getIsActive: char => true
    },
}

const BUTTON_SIZE = 64
const BUTTON_MARGIN = 20
const DEFAULT_ALPHA = 0.5
const HOVER_ALPHA = 0.75
const SELECTED_ALPHA = 1

export class AfterBattleActionsMenu {
    container: O_Container

    // @ts-ignore
    buttons = {} as {
        [action in AfterBattleAction]: {
            sprite: O_Sprite;
            text: O_Text;
            action: AfterBattleAction;
            getIsActive: (char: Char) => boolean
            execute: (char: Char) => void
        };
    };

    selectedAction: AfterBattleAction | null = null

    constructor() {
        const bridgePos = positioner.bridgePosition()
        this.container = o_.render.createContainer(bridgePos.x + bridgePos.width / 2 - 100 - BUTTON_SIZE, bridgePos.y);

        Object.values(actionSpecs).forEach((template, idx) => {
            const action = template.action
            const x = 0
            const y = idx * (BUTTON_MARGIN + BUTTON_SIZE)

            const sprite =  o_.render.createSprite(
                template.resource,
                x,
                y,
                {
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    parent: this.container
                }
            )
            sprite.setInteractive(true, {cursor: 'pointer'})
            sprite.onPointerOver(() => {
                if (this.selectedAction !== action) {
                    sprite.alpha = HOVER_ALPHA
                    text.setVisibility(true)
                }
            })
            sprite.onPointerOut(() => {
                if (this.selectedAction !== action) {
                    sprite.alpha = DEFAULT_ALPHA
                    text.setVisibility(false)
                }
            })
            sprite.onClick(() => this.onButtonClick(template.action))
            sprite.setOrigin(0, 0)
            sprite.alpha = DEFAULT_ALPHA

            const text =  o_.render.createText(
                template.text,
                x - 20,
                y + BUTTON_SIZE / 2,
                {color: colorsCSS.WHITE},
                {parent: this.container}
            )
            text.setOrigin(1, 0.5);
            text.setVisibility(false)

            this.buttons[template.action] = {sprite, text, action, getIsActive: template.getIsActive, execute: template.execute}
        })

        this.hide();
    }

    onButtonClick(action: AfterBattleAction) {
        this.selectButton(action)

        o_.characters.getTravellersAfterBattle().forEach(c => {
            const isActive = actionSpecs[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    actionSpecs[action].execute(char)
                    this.checkEnd()
                    // this.selectButton(null)
                })
                c.setCursor('pointer')
            } else {
                c.sprite.removeClickListener()
                c.setCursor('not-allowed')
            }
        })
    }

    checkEnd() {
        if (o_.characters.getTravellersAfterBattle().length === 0) {
            this.hide()
            onEncounterEnd()
        }
    }

    deselectButton(action: AfterBattleAction) {
        const btn = this.buttons[action]
        const sprite = btn.sprite
        sprite.alpha = DEFAULT_ALPHA
        sprite.setInteractive(true)
        o_.render.flyTo(sprite, {x: 0, y: sprite.y}, 500)

        btn.text.setVisibility(false)
    }

    selectButton(action: AfterBattleAction | null) {
        if (this.selectedAction) this.deselectButton(this.selectedAction)

        this.selectedAction = action

        if (action) {
            const btn = this.buttons[action]
            const sprite = btn.sprite
            sprite.alpha = SELECTED_ALPHA
            sprite.setInteractive(false)
            o_.game.getScene().input.setDefaultCursor('default')

            o_.render.flyTo(sprite, {x: 30, y: sprite.y}, 500)

            btn.text.setVisibility(true)
        }
    }

    show() {
        o_.characters.enableInteractivityOnBridge()
        Object.values(this.buttons).forEach(b => b.sprite.setVisibility(true))
    }

    hide() {
        Object.values(this.buttons).forEach(b => b.sprite.setVisibility(false))
        this.selectButton(null)

        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
    }
}