import {resoursePaths} from "../resourse-paths";
import {o_} from "../managers/locator";
import {LayerKey} from "../managers/core/layers";
import {Vec} from "../utils/utils-math";
import {O_Container} from "../managers/core/render/container";
import {colorsCSS} from "../configs/constants";
import {O_Sprite} from "../managers/core/render/sprite";
import {O_Text} from "../managers/core/render/text";
import {createPromiseAndHandlers} from "../utils/utils-async";
import {CursorType} from "../managers/core/input/cursor";

type BtnTemplate<K> = {
    text: string,
    key: K,
    resource: keyof typeof resoursePaths.images,
    getDisabledAndReason?: () => false | string,
    getText?: () => string
}

const BUTTON_SIZE = 64
const BUTTON_MARGIN = 20
const DEFAULT_ALPHA = 0.5
const HOVER_ALPHA = 0.75
const SELECTED_ALPHA = 1
const DISABLED_ALPHA = 0.33

const MENU_PADDING = BUTTON_MARGIN
const MENU_WIDTH = MENU_PADDING * 2 + BUTTON_SIZE

export class VerticalMenu<Keys extends string> {
    container: O_Container
    selectedKey: Keys | null = null

    buttons = {} as {
        [key: string]: {
            sprite: O_Sprite,
            text: O_Text,
            key: Keys,
            disabledText: O_Text,
            getDisabledAndReason: (() => false | string)
        }
    }

    containerX: number

    constructor(private templates: BtnTemplate<Keys>[], center: Vec, private onClick: (key: Keys) => void) {
        console.log('vertical menu created');
        const height = this.getMenuHeight()
        const y = center.y - height / 2

        this.containerX = center.x - BUTTON_SIZE

        this.container = o_.render.createContainer(this.containerX, y);
        o_.layers.add(this.container, LayerKey.FIELD_BUTTONS)

        const bg = o_.render.createSprite('tile_black', 0, 0, {width: MENU_WIDTH, height, parent: this.container})
        bg.alpha = 0.7
        bg.setOrigin(0, 0)

        templates.forEach((template, idx) => {
            const key = template.key
            const x = MENU_PADDING
            const y = MENU_PADDING + idx * (BUTTON_MARGIN + BUTTON_SIZE)

            const sprite = o_.render.createSprite(
                template.resource,
                x,
                y,
                {
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    parent: this.container
                }
            )
            sprite.setInteractive(true)
            sprite.onPointerOver(() => {
                if (this.selectedKey !== key) {
                    sprite.alpha = HOVER_ALPHA
                    text.setVisibility(true)
                }
            })
            sprite.onPointerOut(() => {
                if (this.selectedKey !== key) {
                    sprite.alpha = DEFAULT_ALPHA
                    text.setVisibility(false)
                }
            })
            sprite.onClick(() => onClick(template.key))
            sprite.setOrigin(0, 0)
            sprite.alpha = DEFAULT_ALPHA

            const text = o_.render.createText({
                textKey: template.getText ? template.getText() : template.text,
                x: x - 20,
                y: y + BUTTON_SIZE / 2,
                style: {color: colorsCSS.WHITE},
                parent: this.container
            })
            text.setOrigin(1, 0.5);
            text.setVisibility(false)

            const disabledText = o_.render.createText({
                textKey: '',
                x: x + BUTTON_SIZE / 2,
                y: y + BUTTON_SIZE / 2,
                style: {color: colorsCSS.WHITE, wordWrap: {width: BUTTON_SIZE * 2}, align: 'center'},
                parent: this.container
            })
            disabledText.setOrigin(0.5, 0.5);
            disabledText.setVisibility(false)

            this.buttons[template.key] = {
                sprite,
                text,
                key,
                disabledText,
                getDisabledAndReason: template.getDisabledAndReason || (() => false)
            }
        })

        this.hide(false);
    }

    getMenuHeight(): number {
        return this.templates.length * (BUTTON_SIZE + BUTTON_MARGIN) - BUTTON_MARGIN + MENU_PADDING * 2
    }

    updateButtons() {
        Object.values(this.buttons).forEach(b => {
            const disabledReason = b.getDisabledAndReason()
            if (disabledReason) this.disableButton(b.key, disabledReason)
            else this.enableButton(b.key)
        })
    }

    deactivateAllButtons() {
        Object.values(this.buttons).forEach(b => {
            b.sprite.setInteractive(false)
        })
    }

    disableButton(action: Keys, text: string) {
        this.deselectButton(action)
        const btn = this.buttons[action]
        const sprite = btn.sprite
        sprite.alpha = DISABLED_ALPHA
        sprite.setInteractive(false)
        btn.disabledText.setText(text)
        btn.disabledText.setVisibility(true)
    }

    enableButton(action: Keys) {
        const btn = this.buttons[action]
        const sprite = btn.sprite
        sprite.alpha = DEFAULT_ALPHA
        sprite.setInteractive(true)
        btn.disabledText.setText('')
        btn.disabledText.setVisibility(false)
    }

    deselectButton(action: Keys) {
        const btn = this.buttons[action]
        const sprite = btn.sprite
        sprite.alpha = DEFAULT_ALPHA
        sprite.setInteractive(true)
        o_.render.flyTo(sprite, {x: MENU_PADDING, y: sprite.y}, 500)

        btn.text.setVisibility(false)
    }

    selectButton(key: Keys | null) {
        if (this.selectedKey) this.deselectButton(this.selectedKey)

        this.selectedKey = key

        if (key) {
            const btn = this.buttons[key]
            const sprite = btn.sprite
            sprite.alpha = SELECTED_ALPHA
            sprite.setInteractive(false)
            o_.input.setCursor(CursorType.DEFAULT)

            o_.render.flyTo(sprite, {x: MENU_PADDING + 30, y: sprite.y}, 500)

            btn.text.setVisibility(true)
        }
    }

    show(withAnimation = true) {
        this.container.setVisibility(true)
        if (withAnimation) {
            this.container.x = this.container.x - 50
            o_.render.fadeIn(this.container, 200)
            this.container.x = this.containerX - 50
            o_.render.flyTo(this.container, {x: this.containerX, y: this.container.y}, 200)
        }
    }

    hide(withAnimation = true): Promise<any> {
        if (withAnimation) {
            const p = createPromiseAndHandlers()
            o_.render.fadeOut(this.container, 250).then(() => {
                this.container.setVisibility(false)
                this.container.x = this.containerX
                this.selectButton(null)
                p.done()
            })
            o_.render.flyTo(this.container, {x: this.containerX + 50, y: this.container.y}, 200)
            return p.promise
        } else {
            this.container.setVisibility(false)
            this.selectButton(null)
            return Promise.resolve()
        }
    }

    isDestroyed = false

    destroy() {
        this.container.destroy()
        this.isDestroyed = true
    }
}