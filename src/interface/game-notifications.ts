import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {getGameSize} from "../utils/utils-misc";
import {LayerKey} from "../managers/core/layers";
import {eventBus, Evt} from "../event-bus";
import {TrollFearLevel} from "../managers/game/troll/types";
import {ImageKey} from "../utils/utils-types";
import {colorsCSS} from "../configs/constants";

const ICON_SIZE = 64
const CONTAINER_PADDING = 10
const PADDING = 20
const TEXT_PADDING = 10
const TEXT_WIDTH = 350
const NOTIFICATION_HEIGHT = ICON_SIZE + PADDING * 2
const NOTIFICATION_WIDTH = ICON_SIZE + PADDING * 2 + TEXT_PADDING + TEXT_WIDTH

const getNotificationWidth = (textWidth: number) =>  ICON_SIZE + PADDING * 2 + TEXT_PADDING + textWidth

const TEXT_X = -(PADDING + ICON_SIZE + TEXT_PADDING)

export class GameNotifications {
    container: O_Container
    notifications: O_Container[] = []
    deleteTimer: any

    constructor() {
        const gameSize = getGameSize()
        this.container = o_.render.createContainer(gameSize.width, CONTAINER_PADDING)

        o_.layers.add(this.container, LayerKey.FIELD_BUTTONS)

        eventBus.on(Evt.FEAR_CHANGES, l => this.onFearChanges(l))
        eventBus.on(Evt.VIGILANTE_PLANNED, t => this.onVigilantePlanned(t))
    }

    private show(str: string, imgKey: ImageKey, color: string = colorsCSS.GREEN) {
        const y = this.notifications.length * (NOTIFICATION_HEIGHT + PADDING)
        const notification = o_.render.createContainer(0, y, {parent: this.container})
        notification.alpha = 0.5
        o_.render.fadeIn(notification)
        o_.render.flyWithBounceTo(notification, {x: 0, y}, 100)

        const bg = o_.render.createSprite('tile_black', 0, 0, {width: NOTIFICATION_WIDTH, height: NOTIFICATION_HEIGHT, parent: notification})
        bg.alpha = 0.3
        bg.setOrigin(1, 0)

        const icon = o_.render.createSprite(imgKey, -PADDING, NOTIFICATION_HEIGHT / 2, {width: ICON_SIZE, height: ICON_SIZE, parent: notification})
        icon.setOrigin(1, 0.5)

        const text = o_.render.createText(
            str,
            TEXT_X,
            NOTIFICATION_HEIGHT / 2,
            {color, fontStyle: 'bold', fontSize: '20px', wordWrap: {width: TEXT_WIDTH}, stroke: colorsCSS.BLACK, strokeThickness: 3},
            {parent: notification}
        )
        text.setOrigin(0.5, 0.5)
        text.x = -(PADDING + ICON_SIZE + TEXT_PADDING + TEXT_WIDTH / 2)
        bg.setWidth(NOTIFICATION_WIDTH, true)

        this.notifications.push(notification)

        this.updateDeleteTimer(5000)
    }

    private updateDeleteTimer(time: number) {
        clearTimeout(this.deleteTimer)
        this.deleteTimer = setTimeout(() => {
            const oldNotifications = this.notifications
            o_.render.fadeOut(oldNotifications).then(() => oldNotifications.forEach(n => n.destroy()))

            this.notifications = []
        }, time)
    }

    private onFearChanges(newLevel: TrollFearLevel) {
        let text = ''
        let icon: ImageKey = 'icon_fear_lowest'

        switch (newLevel) {
            case TrollFearLevel.HARMLESS:
                text = 'Говорят, тролль совсем безобиден!'
                icon = 'icon_fear_lowest'
                break;
            case TrollFearLevel.NOT_SERIOUS:
                text = 'Поговаривают, что тролль не сильно опасен'
                icon = 'icon_fear_low'
                break;
            case TrollFearLevel.UNPREDICTABLE:
                text = 'Люди не знают, что ожидать от тролля на мосту'
                icon = 'icon_fear_medium'
                break;
            case TrollFearLevel.DANGEROUS:
                text = 'Все в окрестностях опасаются тролля'
                icon = 'icon_fear_high'
                break;
            case TrollFearLevel.HORRIFIC:
                text = 'Люди в ужасе от жестокости тролля. Необходимо его истребить!'
                icon = 'icon_fear_highest'
                break;
        }

        this.show(text, icon, colorsCSS.WHITE)
    }

    private onVigilantePlanned(time: number) {
        this.show('Люди решили истребить жестокого тролля. К нему придут через ' + time + ' ходов', 'icon_hand_with_sword', colorsCSS.RED)
    }
}