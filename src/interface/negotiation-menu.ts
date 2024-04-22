import {resoursePaths} from "../resourse-paths";
import {positioner} from "../managers/game/positioner";
import {VerticalMenu} from "./vertical-menu";
import {NegotiationsMessage} from "../types";

type NegotiationActionSpec = {
    key: NegotiationsMessage,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: () => NegotiationsMessage
}

const actionSpecs: { [action in NegotiationsMessage]?: NegotiationActionSpec } = {
    [NegotiationsMessage.DEMAND_PAY]: {
        key: NegotiationsMessage.DEMAND_PAY,
        text: 'Потребовать плату',
        resource: 'icon_pay',
        execute: () => NegotiationsMessage.DEMAND_PAY,
    },

    [NegotiationsMessage.DEMAND_ALL]: {
        key: NegotiationsMessage.DEMAND_ALL,
        text: 'Потребовать все!',
        resource: 'icon_give_all',
        execute: () => NegotiationsMessage.DEMAND_ALL,
    },

    [NegotiationsMessage.GO_IN_PEACE]: {
        key: NegotiationsMessage.GO_IN_PEACE,
        text: 'Отпустить',
        resource: 'icon_speed',
        execute: () => NegotiationsMessage.GO_IN_PEACE,
    },

    [NegotiationsMessage.TO_BATTLE]: {
        key: NegotiationsMessage.TO_BATTLE,
        text: 'Напасть',
        resource: 'icon_crossed_swords_fire',
        execute: () => NegotiationsMessage.TO_BATTLE,
    },
}

export class NegotiationMenu {
    verticalMenu!: VerticalMenu<NegotiationsMessage>

    actions = actionSpecs

    constructor(availableMessages: NegotiationsMessage[], private onClick: (message: NegotiationsMessage) => void) {
        this.verticalMenu = this.createVerticalMenu(availableMessages)
    }

    createVerticalMenu(availableMessages: NegotiationsMessage[]) {
        const bridgePos = positioner.getBridgePosition()
        const y = bridgePos.y + bridgePos.height / 2
        const x = bridgePos.x + bridgePos.width / 4

        const actions = Object.values(actionSpecs).filter(a => availableMessages.includes(a.key))
        this.verticalMenu = new VerticalMenu(actions, {x, y}, (key) => this.onClick(key))
        return this.verticalMenu
    }

    show(availableMessages: NegotiationsMessage[]) {
        this.createVerticalMenu(availableMessages)
        this.verticalMenu.updateButtons()
        this.verticalMenu.show()
    }

    hide() {
        this.verticalMenu.deactivateAllButtons()
        return this.verticalMenu.hide().then(() => {
            this.verticalMenu.container.destroy()
        })
    }
}