import {AfterBattleAction} from "../../interface/char-actions-menu";
import {o_} from "../../managers/locator";
import {resoursePaths} from "../../resourse-paths";
import {Char} from "../../entities/char/char";

type AfterBattleActionSpec = {
    key: AfterBattleAction,
    resource: keyof typeof resoursePaths.images,
    text: string,
    execute: (char: Char) => Promise<void>
    getIsActive: (char: Char) => boolean
}

export const AfterBattleTrollActionS: { [action in AfterBattleAction]: AfterBattleActionSpec } = {
    [AfterBattleAction.RELEASE]: {
        key: AfterBattleAction.RELEASE,
        text: 'Отпустить',
        resource: 'button_release',
        execute: async (char) => o_.characters.releaseChar(char),
        getIsActive: char => true
    },

    [AfterBattleAction.ROB]: {
        key: AfterBattleAction.ROB,
        text: 'Отобрать плату',
        resource: 'icon_pay',
        execute: async (char) => {
            char.dropGold(Math.ceil(char.gold * 0.33), true)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => !char.isRobbed
    },

    [AfterBattleAction.TAKE_ALL]: {
        key: AfterBattleAction.TAKE_ALL,
        text: 'Отобрать все',
        resource: 'icon_give_all',
        execute: async (char) => {
            o_.characters.makeCharGiveAll(char)
            o_.characters.releaseChar(char)
        },
        getIsActive: char => char.gold > 0 || char.food > 0
    },

    [AfterBattleAction.MAKE_FOOD]: {
        key: AfterBattleAction.MAKE_FOOD,
        text: 'Разорвать',
        resource: 'button_make_food',
        execute: async char => o_.characters.transformToFood(char),
        getIsActive: char => true
    },
}