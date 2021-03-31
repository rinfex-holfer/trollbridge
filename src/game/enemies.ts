import {Enemy, EnemyKey, Resources} from "../types";

export function createEnemy(key: EnemyKey): Enemy {
    switch(key) {
        case EnemyKey.FARMER: return        ({ key: EnemyKey.FARMER,    name: 'крестьянин',         resourses: createResources(1, 1, 1) });
        case EnemyKey.MILITIA: return       ({ key: EnemyKey.MILITIA,   name: 'ополченец',          resourses: createResources(1, 1, 1) });
        case EnemyKey.SOLDIER: return       ({ key: EnemyKey.SOLDIER,   name: 'солдат',             resourses: createResources(1, 1, 1) });
        case EnemyKey.KNIGHT: return        ({ key: EnemyKey.KNIGHT,    name: 'рыцарь',             resourses: createResources(1, 1, 1) });
        case EnemyKey.ARISTORAT: return     ({ key: EnemyKey.ARISTORAT, name: 'аристократ',         resourses: createResources(1, 1, 1) });
        case EnemyKey.PRINCE: return        ({ key: EnemyKey.PRINCE,    name: 'принц',              resourses: createResources(1, 1, 1) });
        case EnemyKey.KING: return          ({ key: EnemyKey.KING,      name: 'король',             resourses: createResources(1, 1, 1) });

        case EnemyKey.TRADER: return        ({ key: EnemyKey.TRADER,    name: 'торговец',           resourses: createResources(1, 1, 1) });
        case EnemyKey.CHILD: return         ({ key: EnemyKey.CHILD,     name: 'ребенок',            resourses: createResources(1, 1, 1) });
        case EnemyKey.FARMER_WOMEN: return  ({ key: EnemyKey.FARMER_WOMEN, name: 'крестьянка',      resourses: createResources(1, 1, 1) });
        case EnemyKey.PRINCESS: return      ({ key: EnemyKey.PRINCESS,  name: 'принцесса',          resourses: createResources(1, 1, 1) });

        case EnemyKey.DONKEY: return        ({ key: EnemyKey.DONKEY,    name: 'осел',               resourses: createResources(1, 1, 1) });
        case EnemyKey.TRADE_CART: return    ({ key: EnemyKey.TRADE_CART, name: 'повозка торговца',  resourses: createResources(1, 1, 1) });
        case EnemyKey.CARRIAGE: return      ({ key: EnemyKey.CARRIAGE,  name: 'карета',             resourses: createResources(1, 1, 1) });
        default: throw Error('wrong enemy key ' + key);
    }
}

export function createResources(food: number, materials: number, gold: number): Resources {
    return {
        food,
        materials,
        gold,
    };
}