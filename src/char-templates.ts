import {CharKey, Resources} from "./types";
import {resoursePaths} from "./resourse-paths";

export const charTemplates = {
    [CharKey.FARMER]: {
        name: 'chars.peasant',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: true,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.ARISTOCRAT]: {
        name: 'chars.aristocrat',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.CARRIAGE]: {
        name: 'chars.carriage',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.CHILD]: {
        name: 'chars.child',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.DONKEY]: {
        name: 'chars.donkey',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.FARMER_WOMEN]: {
        name: 'chars.peasant_women',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.KING]: {
        name: 'chars.king',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.KNIGHT]: {
        name: 'chars.knight',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: true,
        animationsPath: resoursePaths.atlases.knight,
    },[CharKey.MILITIA]: {
        name: 'chars.militia',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: true,
        animationsPath: resoursePaths.atlases.militia,
    },[CharKey.PRINCE]: {
        name: 'chars.price',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: true,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.PRINCESS]: {
        name: 'chars.princess',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.SOLDIER]: {
        name: 'chars.soldier',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: true,
        animationsPath: resoursePaths.atlases.soldier,
    },
    [CharKey.TRADE_CART]: {
        name: 'chars.trade_card',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },
    [CharKey.TRADER]: {
        name: 'chars.trader',
        hp: 10,
        createResources: (): Resources => ({gold: 1, materials: 1, food: 1}),
        isCombatant: false,
        animationsPath: resoursePaths.atlases.peasant,
    },

}