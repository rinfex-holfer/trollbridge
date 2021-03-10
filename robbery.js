import {encounterDanger} from "./encounters.js";
import {rnd} from "./utils.js";

const stateKey = {
    START: 'START',
    ALL_GIVEN: 'ALL_GIVEN',
    ALL_AFTER_PAYMENT_GIVEN: 'ALL_AFTER_PAYMENT_GIVEN',
    PAYMENT_GIVEN: 'PAYMENT_GIVEN',
    ALL_REFUSED: 'ALL_REFUSED',
    PAY_REFUSED: 'PAY_REFUSED',
    ALL_AFTER_PAYMENT_REFUSED: 'ALL_AFTER_PAYMENT_REFUSED',
    BATTLE: 'BATTLE',
    END: 'END'
}

const messages = {
    DEMAND_ALL: 'DEMAND_ALL',
    DEMAND_PAY: 'DEMAND_PAY',
    GO_IN_PEACE: 'GO_IN_PEACE',
    TO_BATTLE: 'TO_BATTLE',
    AND_DEMAND_PAY: 'AND_DEMAND_PAY',
    OK: 'OK',
    NO: 'NO',
    DIE_MONSTER: 'DIE_MONSTER',
}

function createEncounter(dangerLevel) {
    let state = states[stateKey.START]

    function goToState(key) {
        state = states[key];
        state.start && state.start();
    }

    return {
        getMessages: () => Object.keys(state.messages),
        onMessage: message => {
            const roll = rnd();

            const edges = state.messages[message][dangerLevel];

            for (const chance in Object.keys(edges)) {
                if (roll < +chance) {
                    goToState(edges[chance].nextState);
                    return edges[chance].text;
                }
            }
        }
    }
}

const states = {
    [stateKey.START]: {
        messages: {
            [messages.DEMAND_ALL]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: { nextState: stateKey.BATTLE,      text: 'Что эта тварь бормочет? Проучить ее!'}
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {nextState: stateKey.BATTLE,       text: 'Монстр, ты оскорбил нас таким наглым требованием. И сейчас ты за это заплатишь!'}
                },
                [encounterDanger.HIGH]:         {
                    50: {nextState: stateKey.ALL_REFUSED,   text: 'Ты слишком многого хочешь, тролль. Пропусти нас сейчас же!'},
                    100: {nextState: stateKey.BATTLE,       text: 'За кого ты нас принимаешь, тролль? Как ты посмел? Мы заставим тебя молить о прощении!'}
                },
                [encounterDanger.MEDIUM]:       {
                    33: {nextState: stateKey.ALL_GIVEN,     text: 'Невероятна жадность твоя. Ладно, забирай все и дай пройти.'},
                    66: {nextState: stateKey.ALL_REFUSED,   text: 'Нет, ты требуешь слишком многого.'},
                    100: {nextState: stateKey.BATTLE,       text: 'Убирайся прочь с дороги, мерзкое создание!'}
                },
                [encounterDanger.LOW]:          {
                    50: {nextState: stateKey.ALL_GIVEN,     text: 'Ладно, тролль-грабитель, забирай все. Чтоб тебя!',},
                    100: {nextState: stateKey.ALL_REFUSED,  text: 'Отдать все до последнего? Ни за что!',}
                },
                [encounterDanger.NONE]:         {
                    90: {nextState: stateKey.ALL_GIVEN,     text: 'Деваться некуда. Забирай все пожитки, безжалостное создание...',},
                    100: {nextState: stateKey.ALL_REFUSED,  text: 'Отдать все тебе и умереть от голода и холода? Ни за что! Лучше на месте ешь, хотя бы быстрее будет.',}
                },
            },
            [messages.DEMAND_PAY]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.BATTLE,       text: 'Какая невероятная наглость. Уберем эту гадость с моста!'}
                },
                [encounterDanger.VERY_HIGH]:    {
                    33: {nextState: stateKey.PAYMENT_GIVEN, text: 'Так уж и быть, возьми плату и дай пройти.',},
                    66: {nextState: stateKey.PAY_REFUSED,   text: 'Ты ничего не получишь. Освободи путь!',},
                    100: {nextState: stateKey.BATTLE,       text: 'Что на нахальство! Это мост Короля, а не твой. Ну, берегись!'}
                },
                [encounterDanger.HIGH]:         {
                    50: {nextState: stateKey.PAYMENT_GIVEN, text: 'Ладно, вот твоя плата.'},
                    75: {nextState: stateKey.PAY_REFUSED,   text: 'Ты ничего не получишь. Уходи.'},
                    100: {nextState: stateKey.BATTLE,       text: 'Ты слишком много на себя берешь, нечестивое создание!',},
                },
                [encounterDanger.MEDIUM]:       {
                    66: {nextState: stateKey.PAYMENT_GIVEN, text: 'Справедливо. Держи оплату за проход.',},
                    90: {nextState: stateKey.PAY_REFUSED,   text: 'Нет, платы ты не дождешься. Дай пройти!',},
                    100: {nextState: stateKey.BATTLE,       text: 'Чем отдавать тебе плату - лучше намять тебе бока!',},
                },
                [encounterDanger.LOW]:          {
                    80: {nextState: stateKey.PAYMENT_GIVEN, text: 'Да, конечно. Вот плата.',},
                    100: {nextState: stateKey.PAY_REFUSED,  text: 'Ты, конечно, страшен. Но платы тебе не видать.',},
                },
                [encounterDanger.NONE]:         {
                    90: {nextState: stateKey.PAYMENT_GIVEN, text: 'Конечно, вот, это твое.',},
                    100: {nextState: stateKey.PAY_REFUSED,  text: 'Отдать тебе последнее - ни за что! Отпусти, дай пройти! Иначе Бог покарает тебя!',},
                },
            },
            [messages.TO_BATTLE]:   {
                [encounterDanger.IMPOSSIBLE]:   {100: {nextState: stateKey.BATTLE, text: 'Ха-ха, эта жалкая тварь собирается броситься!'}},
                [encounterDanger.VERY_HIGH]:    {100: {nextState: stateKey.BATTLE, text: 'Мезркая тварь, тебе не сдобровать.'}},
                [encounterDanger.HIGH]:         {100: {nextState: stateKey.BATTLE, text: 'Злобный тролль, ты пожалеешь о том, что поднимаешь лапу на путников.'}},
                [encounterDanger.MEDIUM]:       {100: {nextState: stateKey.BATTLE, text: 'Ты получишь отпор, чудище!'}},
                [encounterDanger.LOW]:          {100: {nextState: stateKey.BATTLE, text: 'Ааа, тролль атакует!'}},
                [encounterDanger.NONE]:         {100: {nextState: stateKey.BATTLE, text: 'Спасите! Кто-нибудь!'}},
            },
            [messages.GO_IN_PEACE]: {
                [encounterDanger.IMPOSSIBLE]:   {100: {nextState: stateKey.END, text: 'Посторонись, отродье, а не то растопчем.'}},
                [encounterDanger.VERY_HIGH]:    {100: {nextState: stateKey.END, text: 'С дороги, тролль.'}},
                [encounterDanger.HIGH]:         {100: {nextState: stateKey.END, text: 'Что это за зверь?'}},
                [encounterDanger.MEDIUM]:       {100: {nextState: stateKey.END, text: 'Зеленый монстр не мешает, можно идти.'}},
                [encounterDanger.LOW]:          {100: {nextState: stateKey.END, text: 'Будь здоров, смотритель моста.'}},
                [encounterDanger.NONE]:         {100: {nextState: stateKey.END, text: 'Спасибо, что не тронул, добрый тролль.'}},
            }
        }
    },
    [stateKey.ALL_REFUSED]: {
        start: () => {},
        messages: {
            [messages.DEMAND_PAY]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.BATTLE, text: 'Да как ты вообще смеешь! Сейчас поплатишься за дерзость!'},
                },
                [encounterDanger.VERY_HIGH]:    {
                    33: {nextState: stateKey.PAYMENT_GIVEN, text: 'Ладно, просто плату ты, так уж и быть, получишь.'},
                    90: {nextState: stateKey.PAY_REFUSED, text: 'Собираешься содрать хоть что-то? Не тут-то было. Убирайся с дороги!'},
                    100: {nextState: stateKey.BATTLE, text: 'Тебе был дан шанс, упрямая тварь!'},
                },
                [encounterDanger.HIGH]:         {
                    50: {nextState: stateKey.PAYMENT_GIVEN, text: 'Это еще куда ни шло. Держи и дай пройти.'},
                    90: {nextState: stateKey.PAY_REFUSED, text: 'И платы ты тоже не получишь.'},
                    100: {nextState: stateKey.BATTLE, text: 'Да что ты за наглое создание! Ну все, берегись!'},
                },
                [encounterDanger.MEDIUM]:       {
                    66: {nextState: stateKey.PAYMENT_GIVEN, text: 'Это более справедливое требование.'},
                    100: {nextState: stateKey.PAY_REFUSED, text: 'Нет, жадный тролль, ты не получишь и просто платы.'},
                },
                [encounterDanger.LOW]:          {
                    90: {nextState: stateKey.PAYMENT_GIVEN, text: 'Так бы сразу. Вот, это твое.'},
                    100: {nextState: stateKey.PAY_REFUSED, text: 'Тролль, будь добр, пропусти за так?'},
                },
                [encounterDanger.NONE]:         {
                    95: {nextState: stateKey.PAYMENT_GIVEN, text: 'Ох, ладно, тролль. Вот плата.'},
                    100: {nextState: stateKey.PAY_REFUSED, text: 'Не отнимай последнее, пожалуйста...'},
                },
            },
            [messages.TO_BATTLE]:   {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.BATTLE, text: 'Сейчас поплатишься за дерзость!'},
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {nextState: stateKey.BATTLE, text: 'Приготовься быть униженным!'},
                },
                [encounterDanger.HIGH]:         {
                    100: {nextState: stateKey.BATTLE, text: 'Ты будешь повержен!'},
                },
                [encounterDanger.MEDIUM]:       {
                    100: {nextState: stateKey.BATTLE, text: 'Тролль атакует!'},
                },
                [encounterDanger.LOW]:          {
                    100: {nextState: stateKey.BATTLE, text: 'Ой-ей!'},
                },
                [encounterDanger.NONE]:         {
                    100: {nextState: stateKey.BATTLE, text: 'Нет! Пожалуйста, не трогай!'},
                },
            },
            [messages.GO_IN_PEACE]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.END, text: 'Прочь с дороги.'},
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {nextState: stateKey.END, text: 'То-то же.'},
                },
                [encounterDanger.HIGH]:         {
                    100: {nextState: stateKey.END, text: 'Освободи путь.'},
                },
                [encounterDanger.MEDIUM]:       {
                    100: {nextState: stateKey.END, text: 'Сразу бы так.'},
                },
                [encounterDanger.LOW]:          {
                    100: {nextState: stateKey.END, text: 'Ну, значит, можно идти...'},
                },
                [encounterDanger.NONE]:         {
                    100: {nextState: stateKey.END, text: 'Спасибо, что не злишься.'},
                },
            },
        }
    },
    [stateKey.ALL_GIVEN]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.BATTLE, text: 'Тварь обезумела!'},
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {nextState: stateKey.BATTLE, text: 'Тварь обезумела!'},
                },
                [encounterDanger.HIGH]:         {
                    100: {nextState: stateKey.BATTLE, text: 'Тролль совсем обезумел!'},
                },
                [encounterDanger.MEDIUM]:       {
                    100: {nextState: stateKey.BATTLE, text: 'Что за коварство?!'},
                },
                [encounterDanger.LOW]:          {
                    100: {nextState: stateKey.BATTLE, text: 'Ты чего, тролль?!'},
                },
                [encounterDanger.NONE]:         {
                    100: {nextState: stateKey.BATTLE, text: 'Но почему?! За что?!'},
                },
            },
            [messages.GO_IN_PEACE]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {nextState: stateKey.END, text: '...'},
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {nextState: stateKey.END, text: 'Твой счастливый день.'},
                },
                [encounterDanger.HIGH]:         {
                    100: {nextState: stateKey.END, text: 'Зеленый грабитель...'},
                },
                [encounterDanger.MEDIUM]:       {
                    100: {nextState: stateKey.END, text: 'Тебе это аукнется...'},
                },
                [encounterDanger.LOW]:          {
                    100: {nextState: stateKey.END, text: 'Убратья бы отсюда поскорей...'},
                },
                [encounterDanger.NONE]:         {
                    100: {nextState: stateKey.END, text: 'Как бы теперь не умереть с голоду...'},
                },
            },
        }
    },
    [stateKey.PAYMENT_GIVEN]: {
        start: () => {},
        messages: {
            [messages.DEMAND_ALL]: {
                [encounterDanger.IMPOSSIBLE]:   {100: stateKey.BATTLE},
                [encounterDanger.VERY_HIGH]:    {100: stateKey.BATTLE},
                [encounterDanger.HIGH]:         {50: stateKey.ALL_AFTER_PAYMENT_REFUSED, 100: stateKey.BATTLE},
                [encounterDanger.MEDIUM]:       {75: stateKey.ALL_AFTER_PAYMENT_REFUSED, 100: stateKey.BATTLE},
                [encounterDanger.LOW]:          {33: stateKey.ALL_AFTER_PAYMENT_GIVEN, 90: stateKey.ALL_AFTER_PAYMENT_REFUSED, 100: stateKey.BATTLE},
                [encounterDanger.NONE]:         {75: stateKey.ALL_AFTER_PAYMENT_GIVEN, 100: stateKey.ALL_AFTER_PAYMENT_REFUSED},
            },
            [messages.TO_BATTLE]:   stateKey.BATTLE,
            [messages.GO_IN_PEACE]: stateKey.END,
        }
    },
    [stateKey.PAY_REFUSED]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   stateKey.BATTLE,
            [messages.GO_IN_PEACE]: stateKey.END,
        }
    },
    [stateKey.ALL_AFTER_PAYMENT_REFUSED]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   stateKey.BATTLE,
            [messages.GO_IN_PEACE]: stateKey.END,
        }
    },
}

const createRobberyStates = (game) => ({
    [stateKey.START]: {
        on: (message, danger) => {
            const roll = rnd();
            switch (message) {
                case stateKey.DEMAND_ALL:
                    switch (danger) {
                        case encounterDanger.IMPOSSIBLE:
                        case encounterDanger.VERY_HIGH:
                            goToState(stateKey.BATTLE);
                            break;
                        case encounterDanger.HIGH:
                            if (roll <= chances.highGiveAllAttack)
                                goToState(stateKey.BATTLE);
                            else goToState(stateKey.ALL_REFUSED);
                            break;
                        case encounterDanger.MEDIUM:
                            if (roll <= chances.mediumGiveAll) {
                                goToState(stateKey.ALL_GIVEN);
                            } else if (roll <= chances.mediumGiveAllAttack) goToState(stateKey.BATTLE);
                            else goToState(stateKey.ALL_REFUSED);
                            break;
                        case encounterDanger.LOW:
                            if (roll <= chances.mediumGiveAll) {
                                goToState(stateKey.ALL_GIVEN);
                            } else if (roll <= chances.mediumGiveAllAttack) goToState(stateKey.BATTLE);
                            else goToState(stateKey.ALL_REFUSED);
                            break;
                        default:
                            goToState(stateKey.ALL_GIVEN);
                            break;
                    }
            }
        }
    }
});