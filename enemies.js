import {createResources} from "./resourses";

export const EnemyKey = {
    FARMER: 'FARMER',
    MILITIA: 'MILITIA',
    SOLDIER: 'SOLDIER',
    KNIGHT: 'KNIGHT',
    ARISTORAT: 'ARISTORAT',
    PRINCE: 'PRINCE',
    KING: 'KING',
    TRADER: 'TRADER',
    CHILD: 'CHILD',
    FARMER_WOMEN: 'FARMER_WOMEN',
    PRINCESS: 'PRINCESS',
    DONKEY: 'DONKEY',
    TRADE_CART: 'TRADE_CART',
    CARRIAGE: 'CARRIAGE',
}

export const createEnemy = {
    [EnemyKey.FARMER]: () =>        ({ key: EnemyKey.FARMER,    name: 'крестьянин',         resourses: createResources(1, 1, 1) }),
    [EnemyKey.MILITIA]: () =>       ({ key: EnemyKey.MILITIA,   name: 'ополченец',          resourses: createResources(1, 1, 1) }),
    [EnemyKey.SOLDIER]: () =>       ({ key: EnemyKey.SOLDIER,   name: 'солдат',             resourses: createResources(1, 1, 1) }),
    [EnemyKey.KNIGHT]: () =>        ({ key: EnemyKey.KNIGHT,    name: 'рыцарь',             resourses: createResources(1, 1, 1) }),
    [EnemyKey.ARISTORAT]: () =>     ({ key: EnemyKey.ARISTORAT, name: 'аристократ',         resourses: createResources(1, 1, 1) }),
    [EnemyKey.PRINCE]: () =>        ({ key: EnemyKey.PRINCE,    name: 'принц',              resourses: createResources(1, 1, 1) }),
    [EnemyKey.KING]: () =>          ({ key: EnemyKey.KING,      name: 'король',             resourses: createResources(1, 1, 1) }),

    [EnemyKey.TRADER]: () =>        ({ key: EnemyKey.TRADER,    name: 'торговец',           resourses: createResources(1, 1, 1) }),
    [EnemyKey.CHILD]: () =>         ({ key: EnemyKey.CHILD,     name: 'ребенок',            resourses: createResources(1, 1, 1) }),
    [EnemyKey.FARMER_WOMEN]:() =>   ({ key: EnemyKey.FARMER_WOMEN, name: 'крестьянка',      resourses: createResources(1, 1, 1) }),
    [EnemyKey.PRINCESS]: () =>      ({ key: EnemyKey.PRINCESS,  name: 'принцесса',          resourses: createResources(1, 1, 1) }),

    [EnemyKey.DONKEY]: () =>        ({ key: EnemyKey.DONKEY,    name: 'осел',               resourses: createResources(1, 1, 1) }),
    [EnemyKey.TRADE_CART]: () =>    ({ key: EnemyKey.TRADE_CART, name: 'повозка торговца',  resourses: createResources(1, 1, 1) }),
    [EnemyKey.CARRIAGE]: () =>      ({ key: EnemyKey.CARRIAGE,  name: 'карета',             resourses: createResources(1, 1, 1) }),
}