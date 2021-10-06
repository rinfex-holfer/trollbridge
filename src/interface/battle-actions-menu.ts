import {o_} from "../managers/locator";
import {BattleAction, CharAction} from "./char-actions-menu";
import {resoursePaths} from "../resourse-paths";
import {Char} from "../entities/char/char";
import {colorsCSS} from "../configs/constants";
import {positioner} from "../managers/game/positioner";
import {O_Container} from "../managers/core/render/container";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";

type BattleActionSpec = {
    action: BattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: (char: Char) => void
    getIsActive: (char: Char) => boolean
}

const actionSpecs: {[action in BattleAction]: BattleActionSpec} = {
    [BattleAction.BATTLE_HIT]: {
        action: BattleAction.BATTLE_HIT,
        text: 'Ударить',
        resource: 'button_strike',
        execute: char => o_.battle.trollGoAttack(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered()
    },

    [BattleAction.BATTLE_THROW_ROCK]: {
        action: BattleAction.BATTLE_THROW_ROCK,
        text: 'Метнуть камень',
        resource: 'button_throw_rock',
        execute: char => o_.battle.trollThrowRock(char),
        getIsActive: char => char.hp > 0 && o_.bridge.getHasAvailableRocks() && !(char.isUnconscious && char.getIsCovered())
    },

    [BattleAction.BATTLE_THROW_CHAR]: {
        action: BattleAction.BATTLE_THROW_CHAR,
        text: 'Бросить об землю',
        resource: 'button_throw_char',
        execute: char => o_.battle.trollGoThrowChar(char),
        getIsActive: char => char.hp > 0 && !char.getIsCovered()
    },

    [BattleAction.BATTLE_DEVOUR]: {
        action: BattleAction.BATTLE_DEVOUR,
        text: 'Сожрать',
        resource: 'button_devour',
        execute: char => o_.battle.trollGoDevour(char),
        getIsActive: char => (char.isUnconscious || char.isSurrender) && !char.getIsCovered()
    },
}

const BUTTON_SIZE = 64
const BUTTON_MARGIN = 20
const DEFAULT_ALPHA = 0.5
const HOVER_ALPHA = 0.75
const SELECTED_ALPHA = 1

export class BattleActionsMenu {
    container: O_Container

    // @ts-ignore
    buttons = {} as {
        [action in BattleAction]: {
            sprite: O_Sprite;
            text: O_Text;
            action: BattleAction;
            execute: (char: Char) => void
            getIsActive: (char: Char) => boolean
        };
    };

    selectedAction: BattleAction | null = null

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
            sprite.onClick(() => this.onClick(template.action))
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

            this.buttons[template.action] = {sprite, text, action, execute: template.execute, getIsActive: template.getIsActive}
        })

        this.hide();
    }

    onClick(action: BattleAction) {
        this.selectButton(action)

        o_.characters.getSquadChars().forEach(c => {
            const isActive = actionSpecs[action].getIsActive(c)
            if (isActive) {
                c.onSpriteClicked(char => {
                    actionSpecs[action].execute(char)
                    this.selectButton(null)
                })
                c.setCursor('pointer')
            } else {
                c.sprite.removeClickListener()
                c.setCursor('not-allowed')
            }
        })
    }

    deselectButton(action: BattleAction) {
        const btn = this.buttons[action]
        const sprite = btn.sprite
        sprite.alpha = DEFAULT_ALPHA
        sprite.setInteractive(true)
        o_.render.flyTo(sprite, {x: 0, y: sprite.y}, 500)

        btn.text.setVisibility(false)
    }

    selectButton(action: BattleAction | null) {
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
        Object.values(this.buttons).forEach(b => b.sprite.setVisibility(true))
    }

    hide() {
        Object.values(this.buttons).forEach(b => b.sprite.setVisibility(false))

        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
    }
}