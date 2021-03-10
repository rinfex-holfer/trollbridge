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

function goToState(key) {

}

const states = {
    [stateKey.START]: {
        messages: {
            [messages.DEMAND_ALL]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Что эта тварь бормочет? Проучить ее!'
                    }
                },
                [encounterDanger.VERY_HIGH]:    {
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Монстр, ты оскорбил нас таким наглым требованием. И сейчас ты за это заплатишь!'
                    }
                },
                [encounterDanger.HIGH]:         {
                    50: {
                        nextState: stateKey.ALL_REFUSED,
                        text: 'Ты слишком многого хочешь, тролль. Пропусти нас сейчас же!'
                    },
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'За кого ты нас принимаешь, тролль? Как ты посмел? Мы заставим тебя молить о прощении!'
                    }
                },
                [encounterDanger.MEDIUM]:       {
                    33: {
                        nextState: stateKey.ALL_GIVEN,
                        text: 'Невероятна жадность твоя. Ладно, забирай все и дай пройти.'
                    },
                    66: {
                        nextState: stateKey.ALL_REFUSED,
                        text: 'Нет, ты требуешь слишком многого.'
                    },
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Убирайся прочь с дороги, мерзкое создание!'
                    }
                },
                [encounterDanger.LOW]:          {
                    50: {
                        nextState: stateKey.ALL_GIVEN,
                        text: 'Ладно, тролль-грабитель, забирай все. Чтоб тебя!',
                    },
                    100: {
                        nextState: stateKey.ALL_REFUSED,
                        text: 'Отдать все до последнего? Ни за что!',
                    }
                },
                [encounterDanger.NONE]:         {
                    90: {
                        nextState: stateKey.ALL_GIVEN,
                        text: 'Деватья некуда. Забирай все пожитки, безжалостное создание...',
                    },
                    100: {
                        nextState: stateKey.ALL_REFUSED,
                        text: 'Отдать все тебе и умереть от голода и холода? Ни за что! Лучше на месте ешь, хотя бы быстрее будет.',
                    }
                },
            },
            [messages.DEMAND_PAY]: {
                [encounterDanger.IMPOSSIBLE]:   {
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Какая невероятная наглость. Уберем эту гадость с моста!'
                    }
                },
                [encounterDanger.VERY_HIGH]:    {
                    33: {
                        nextState: stateKey.PAYMENT_GIVEN,
                        text: 'Так уж и быть, возьми плату и дай пройти.',
                    },
                    66: {
                        nextState: stateKey.PAY_REFUSED,
                        text: 'Ты ничего не получишь. Освободи путь!',
                    },
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Что на нахальство! Это мост Короля, а не твой. Ну, берегись!'
                    }
                },
                [encounterDanger.HIGH]:         {
                    50: {
                        nextState: stateKey.PAYMENT_GIVEN,
                        text: 'Ладно, вот твоя плата.'
                    },
                    75: {
                        nextState: stateKey.PAY_REFUSED,
                        text: 'Ты ничего не получишь. Уходи.'
                    },
                    100: {
                        nextState: stateKey.BATTLE,
                        text: 'Ты слишком много на себя берешь, нечестивое создание!',
                    },
                },
                [encounterDanger.MEDIUM]:       {
                    66: stateKey.PAYMENT_GIVEN,
                    90: stateKey.PAY_REFUSED,
                    100: stateKey.BATTLE
                },
                [encounterDanger.LOW]:          {80: stateKey.PAYMENT_GIVEN, 100: stateKey.PAY_REFUSED},
                [encounterDanger.NONE]:         {90: stateKey.PAYMENT_GIVEN, 100: stateKey.PAY_REFUSED},
            },
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
        }
    },
    [stateKey.ALL_REFUSED]: {
        start: () => {},
        messages: {
            [messages.DEMAND_PAY]: {
                [encounterDanger.IMPOSSIBLE]:   {100: stateKey.BATTLE},
                [encounterDanger.VERY_HIGH]:    {33: stateKey.PAYMENT_GIVEN, 90: stateKey.PAY_REFUSED, 100: stateKey.BATTLE},
                [encounterDanger.HIGH]:         {50: stateKey.PAYMENT_GIVEN, 90: stateKey.PAY_REFUSED, 100: stateKey.BATTLE},
                [encounterDanger.MEDIUM]:       {66: stateKey.PAYMENT_GIVEN, 100: stateKey.PAY_REFUSED},
                [encounterDanger.LOW]:          {90: stateKey.PAYMENT_GIVEN, 100: stateKey.PAY_REFUSED},
                [encounterDanger.NONE]:         {95: stateKey.PAYMENT_GIVEN, 100: stateKey.PAY_REFUSED},
            },
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
        }
    },
    [stateKey.ALL_GIVEN]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
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
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
        }
    },
    [stateKey.PAY_REFUSED]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
        }
    },
    [stateKey.ALL_AFTER_PAYMENT_REFUSED]: {
        start: () => {},
        messages: {
            [messages.TO_BATTLE]:   {uncond: stateKey.BATTLE},
            [messages.GO_IN_PEACE]: {uncond: stateKey.END},
        }
    },
}

const createRobberyStates = (game) => ({
    [stateKey.START]: {
        on: (message, danger) => {
            let roll;
            switch (message) {
                case stateKey.DEMAND_ALL:
                    switch (danger) {
                        case encounterDanger.IMPOSSIBLE:
                        case encounterDanger.VERY_HIGH:
                            goToState(stateKey.BATTLE);
                            break;
                        case encounterDanger.HIGH:
                            if (rnd() <= chances.highGiveAllAttack)
                                goToState(stateKey.BATTLE);
                            else goToState(stateKey.ALL_REFUSED);
                            break;
                        case encounterDanger.MEDIUM:
                            roll = rnd();
                            if (roll <= chances.mediumGiveAll) {
                                goToState(stateKey.ALL_GIVEN);
                            } else if (roll <= chances.mediumGiveAllAttack) goToState(stateKey.BATTLE);
                            else goToState(stateKey.ALL_REFUSED);
                            break;
                        case encounterDanger.LOW:
                            roll = rnd();
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