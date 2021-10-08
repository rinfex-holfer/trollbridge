import {CharKey, Resources} from "../types";
import {resoursePaths} from "../resourse-paths";
import {rndBetween} from "../utils/utils-math";
import {AtlasKey} from "../utils/utils-types";

type CharTemplate = {
    name: string,
    hp: number,
    morale: number,
    moralePrice: number,
    dmg: [min: number, max: number],
    resources: {
        gold: [min: number, max: number],
        food: [min: number, max: number],
    }
    isCombatant: boolean,
    atlasKey: AtlasKey,
    block?: number,
    counterAttack?: number,
    isDefender?: boolean,
    isRanged?: boolean,
    isMounted?: boolean
}

export const charConfig: {[key: string]: CharTemplate} = {
    [CharKey.FARMER]: {
        name: 'chars.peasant',
        hp: 10,
        morale: 20,
        moralePrice: 10,
        dmg: [1, 2],
        resources: {gold: [1, 10], food: [1, 4]},
        isCombatant: true,
        atlasKey: 'peasant',
        isDefender: false,
        isRanged: false,
    },

    [CharKey.MILITIA]: {
        name: 'chars.militia',
        hp: 15,
        morale: 30,
        moralePrice: 15,
        dmg: [1, 4],
        resources: {gold: [1, 10], food: [1, 4]},
        isCombatant: true,
        atlasKey: 'pikeman',
        counterAttack: 0.75,
        isDefender: false,
        isRanged: false,
    },

    [CharKey.ARCHER]: {
        name: 'chars.archer',
        hp: 15,
        morale: 30,
        moralePrice: 15,
        dmg: [5, 8],
        resources: {gold: [1, 10], food: [1, 4]},
        isCombatant: true,
        atlasKey: 'archer',
        isDefender: false,
        isRanged: true,
    },

    [CharKey.SHIELDMAN]: {
        name: 'chars.shieldman',
        hp: 20,
        morale: 100,
        moralePrice: 25,
        dmg: [4, 6],
        block: 0.5,
        resources: {gold: [1, 10], food: [1, 4]},
        isCombatant: true,
        atlasKey: 'shieldman',
        isDefender: true,
        isRanged: false,
    },
    [CharKey.KNIGHT]: {
        name: 'chars.knight',
        hp: 50,
        morale: 300,
        moralePrice: 50,
        dmg: [10, 15],
        counterAttack: 0.5,
        block: 0.5,
        resources: {gold: [1, 10], food: [1, 4]},
        isCombatant: true,
        atlasKey: 'knight',
        isMounted: true,
    },


    //
    //
    //
    //
    // [CharKey.ARISTOCRAT]: {
    //     name: 'chars.aristocrat',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.CARRIAGE]: {
    //     name: 'chars.carriage',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.CHILD]: {
    //     name: 'chars.child',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.DONKEY]: {
    //     name: 'chars.donkey',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.FARMER_WOMEN]: {
    //     name: 'chars.peasant_women',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.KING]: {
    //     name: 'chars.king',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.PRINCE]: {
    //     name: 'chars.price',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: true,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.PRINCESS]: {
    //     name: 'chars.princess',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.TRADE_CART]: {
    //     name: 'chars.trade_card',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },
    // [CharKey.TRADER]: {
    //     name: 'chars.trader',
    //     hp: 10,
    //     morale: 10,
    //     moralePrice: 10,
    //     dmg: 1,
    //     resources: {gold: [1, 10], food: [1, 4]},
    //     isCombatant: false,
    //     animationsPath: resoursePaths.atlases.peasant,
    // },

}