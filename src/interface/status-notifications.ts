import {O_Container} from "../managers/core/render/container";
import {o_} from "../managers/locator";
import {ImageKey} from "../utils/utils-types";
import {colorsCSS} from "../configs/constants";

const ICON_SIZE = 36
const PADDING = 5
const TEXT_PADDING = 10
const TEXT_WIDTH = 100
const NOTIFICATION_HEIGHT = ICON_SIZE + PADDING * 2
const NOTIFICATION_WIDTH = ICON_SIZE + PADDING * 2 + TEXT_PADDING + TEXT_WIDTH

const getNotificationWidth = (textWidth: number) =>  ICON_SIZE + PADDING * 2 + TEXT_PADDING + textWidth

const TEXT_X = PADDING + ICON_SIZE + TEXT_PADDING

export class StatusNotifications {
    container: O_Container
    notifications: O_Container[] = []
    deleteTimer: any

    constructor(parent: O_Container, x: number, y: number) {
        this.container = o_.render.createContainer(x - NOTIFICATION_WIDTH / 2, y - NOTIFICATION_HEIGHT, {parent})
    }

    // private show(str: string, imgKey: ImageKey, color: string = colorsCSS.GREEN) {
    private show(str: string, imgKey: ImageKey, color: string = colorsCSS.GREEN) {
        const y = -this.notifications.length * (NOTIFICATION_HEIGHT + PADDING)
        const notification = o_.render.createContainer(0, y - 30, {parent: this.container})
        notification.alpha = 0.5
        o_.render.fadeIn(notification)
        o_.render.flyWithBounceTo(notification, {x: 0, y}, 100)

        const bg = o_.render.createSprite('tile_black', 0, 0, {width: NOTIFICATION_WIDTH, height: NOTIFICATION_HEIGHT, parent: notification})
        bg.alpha = 0.3
        bg.setOrigin(0, 0)

        const icon = o_.render.createSprite(imgKey, PADDING, NOTIFICATION_HEIGHT / 2, {width: ICON_SIZE, height: ICON_SIZE, parent: notification})
        icon.setOrigin(0, 0.5)

        const text = o_.render.createText(str, TEXT_X, NOTIFICATION_HEIGHT / 2, {color, fontStyle: 'bold', fontSize: '20px'}, {parent: notification})
        text.setOrigin(0, 0.5)

        bg.setWidth(getNotificationWidth(text.width), true)

        this.notifications.push(notification)

        this.updateDeleteTimer()
    }

    updateDeleteTimer() {
        clearTimeout(this.deleteTimer)
        this.deleteTimer = setTimeout(() => {
            const oldNotifications = this.notifications
            o_.render.fadeOut(oldNotifications).then(() => oldNotifications.forEach(n => n.destroy()))

            this.notifications = []
        }, 2000)
    }

    public showBlock() {
        this.show('block!', 'icon_shield', colorsCSS.WHITE)
    }

    public showSurrender() {
        this.show('surrender!', 'icon_surrender', colorsCSS.WHITE)
    }

    // public showDmg(val: number) {
    //     this.show('' + val, 'status_change_dmg', colorsCSS.RED)
    // }
    //
    // public showHeal(val: number) {
    //     this.show('' + val, 'status_change_heal', colorsCSS.GREEN)
    // }
    //
    // public showSelfControlReduce(val: number) {
    //     this.show('' + val, 'status_change_self_control', colorsCSS.RED)
    // }
    //
    // public showSelfControlIncrease(val: number) {
    //     this.show('' + val, 'status_change_self_control', colorsCSS.BLUE)
    // }
    //
    // public showMoraleReduce(val: number) {
    //     this.show('' + val, 'status_change_morale', colorsCSS.RED)
    // }
}