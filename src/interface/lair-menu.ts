import {VerticalMenu} from "./vertical-menu";
import {positioner} from "../managers/game/positioner";
import {o_} from "../managers/locator";
import {eventBus, Evt} from "../event-bus";

enum ButtonsKeys {
    // WAIT = 'WAIT',
    UPGRADE = 'UPGRADE',
}

export class LairMenu {
    verticalMenu: VerticalMenu<ButtonsKeys>

    constructor() {
        const pos = positioner.getLairPosition()

        const y = pos.y + pos.height / 2
        const x = pos.x - 100

        this.verticalMenu = new VerticalMenu([
            // {
            //     key: ButtonsKeys.WAIT,
            //     text: 'Ждать',
            //     resource: 'button_wait'
            // },
            {
                key: ButtonsKeys.UPGRADE,
                text: 'Строить',
                resource: 'button_upgrade'
            }
        ], {x, y}, (key) => this.onClick(key))
    }

    onClick(action: ButtonsKeys) {
        switch (action) {
            // case ButtonsKeys.WAIT:
            //     eventBus.emit(Evt.INTERFACE_WAIT_BUTTON_CLICKED)
            //     o_.upgrade.hideButtons()
            //     o_.time.wait();
            //     break;
            case ButtonsKeys.UPGRADE:
                eventBus.emit(Evt.INTERFACE_OPEN_BUILD_MENU_BUTTON_CLICKED)
                break;
        }
    }

    private deselectUpgradeMenu() {
        this.verticalMenu.deselectButton(ButtonsKeys.UPGRADE)
    }

    show() {
        this.verticalMenu.show(false)
    }

    hide() {
        this.verticalMenu.hide(false)

        o_.characters.getSquadChars().forEach(c => c.sprite.removeClickListener())
    }
}