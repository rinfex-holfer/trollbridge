import {rnd} from "../../utils/utils-math";
import {EncounterDanger, TrollLocation} from "../../types";
import {eventBus, Evt} from "../../event-bus";
import {BasicButton} from "../../interface/basic/basic-button";
import {colors} from "../../constants";
import {SimpleButton} from "../../interface/basic/simple-button";
import {positioner} from "./positioner";
import {O_Container} from "../core/render/container";
import {o_} from "../locator";
import {onEncounterEnd, onEncounterStart} from "../../helpers";

export const enum NegotiationsState {
    START = 'START',
    ALL_GIVEN = 'ALL_GIVEN',
    PAYMENT_GIVEN = 'PAYMENT_GIVEN',
    ALL_REFUSED = 'ALL_REFUSED',
    PAY_REFUSED = 'PAY_REFUSED',
    BATTLE = 'BATTLE',
    END = 'END'
}

const enum NegotiationsMessage {
    DEMAND_ALL = 'DEMAND_ALL',
    DEMAND_PAY = 'DEMAND_PAY',
    GO_IN_PEACE = 'GO_IN_PEACE',
    TO_BATTLE = 'TO_BATTLE',
}

const BUTTON_WIDTH = 150;
const BUTTON_MARGIN = 30;

const getButtonsRowWidth = (amount: number) => amount * BUTTON_WIDTH + (amount - 1) * BUTTON_MARGIN;

export class Negotiations {
    currentStateKey = NegotiationsState.START;
    encounterState: any
    danger: EncounterDanger = EncounterDanger.NONE;

    container: O_Container
    buttons: BasicButton[] = []
    travellersReadyToTalk = [] as string[];

    constructor() {
        eventBus.on(Evt.TROLL_LOCATION_CHANGED, (str) => this.onTrollLocationChange(str));
        eventBus.on(Evt.CHAR_READY_TO_TALK, id => this.onTravellerReadyToTalk(id));
        eventBus.on(Evt.TRAVELLERS_APPEAR, () => this.onTravellersAppear());

        const bridgePos = positioner.bridgePosition()
        this.container = o_.render.createContainer(bridgePos.x + bridgePos.width / 2, bridgePos.y  + bridgePos.height + 64)
        // this.container.zIndex = zLayers.CHAR_MENU;
    }

    onTravellersAppear() {
        if (o_.troll.location === TrollLocation.BRIDGE) {
            onEncounterStart()
        }
    }

    onTrollLocationChange(location: TrollLocation) {
        if (
            location === TrollLocation.BRIDGE &&
            o_.characters.getNewTravellers().length
        ) {
            onEncounterStart()
        }
    }

    onEncounterEnd() {
        this.buttons.forEach(b => b.destroy());
        this.buttons = [];
        this.encounterState = null;
        this.danger = EncounterDanger.NONE;

        o_.characters.letAllTravellersPass();

        onEncounterEnd();
    }

    onTravellerReadyToTalk(id: string) {
        this.travellersReadyToTalk.push(id);
        if (this.travellersReadyToTalk.length === o_.characters.getTravellers().length) {
            this.travellersReadyToTalk = [];
            this.startNegotiations(o_.characters.getDangerKey());
        }
    }

    startNegotiations(danger: EncounterDanger) {
        this.danger = danger;
        this.currentStateKey = NegotiationsState.START
        this.encounterState = negotiationTree[this.currentStateKey]
        this.onStateChange()
    }

    onStateChange(travellersReaction: string = '') {
        switch (this.currentStateKey) {
            case NegotiationsState.START:
                o_.characters.stopAllTravellers();
                break;
            case NegotiationsState.ALL_GIVEN:
                o_.characters.makeAllTravellersGiveAll();
                break;
            case NegotiationsState.PAYMENT_GIVEN:
                o_.characters.makeAllTravellersPay();
                break;
            case NegotiationsState.BATTLE:
                o_.battle.startBattle()
                break;
            case NegotiationsState.END:
                this.onEncounterEnd()
                break;
        }
        o_.characters.travellersSpeak(travellersReaction);
        this.updateDialogButtons();
    }

    updateDialogButtons() {
        this.buttons.forEach(b => b.destroy());

        if (!this.encounterState) return;

        const answers = this.getDialogVariants();
        const fullWidth = getButtonsRowWidth(answers.length)

        let x = - fullWidth / 2
        this.buttons = answers.map((text, idx) => {
            const b = new SimpleButton({
                text,
                onClick: () => this.onMessage(text),
                style: {
                    align: 'center',
                    fill: colors.WHITE,
                    wordWrapWidth: BUTTON_WIDTH,
                    fontSize: 18,
                    wordWrap: true
                },
                x,
                parent: this.container
            })

            x += (BUTTON_WIDTH + BUTTON_MARGIN);

            return b;
        })
    }

    getDialogVariants(): NegotiationsMessage[] {
        // @ts-ignore
        return Object.keys(this.encounterState);
    }

    onMessage(message: NegotiationsMessage) {
        const roll = rnd() * 100;

        if (!this.encounterState[message]) {
            throw Error('wrong message ' + message)
        }

        const edges = this.encounterState[message][this.danger];

        for (const chance in edges) {
            if (roll < +chance) {
                this.currentStateKey = edges[+chance].nextState;
                this.encounterState = negotiationTree[this.currentStateKey];

                this.onStateChange(edges[+chance].text);

                return;
            }
        }
    }
}

type NegotiationTree = {
    [encounterStateKey in NegotiationsState]: {
        [messageKey in NegotiationsMessage]?: {
            [dangerKey in EncounterDanger]: {
                [key: number]: {nextState: NegotiationsState, text: string}
            }
        }
    };
};


const negotiationTree: NegotiationTree = {
    [NegotiationsState.START]: {
        [NegotiationsMessage.DEMAND_ALL]: {
            [EncounterDanger.IMPOSSIBLE]:   {
                100: { nextState: NegotiationsState.BATTLE,      text: 'Что эта тварь бормочет? Проучить ее!'}
            },
            [EncounterDanger.VERY_HIGH]:    {
                100: {nextState: NegotiationsState.BATTLE,       text: 'Монстр, ты оскорбил нас таким наглым требованием. И сейчас ты за это заплатишь!'}
            },
            [EncounterDanger.HIGH]:         {
                50: {nextState: NegotiationsState.ALL_REFUSED,   text: 'Ты слишком многого хочешь, тролль. Пропусти нас сейчас же!'},
                100: {nextState: NegotiationsState.BATTLE,       text: 'За кого ты нас принимаешь, тролль? Как ты посмел? Мы заставим тебя молить о прощении!'}
            },
            [EncounterDanger.MEDIUM]:       {
                33: {nextState: NegotiationsState.ALL_GIVEN,     text: 'Невероятна жадность твоя. Ладно, забирай все и дай пройти.'},
                66: {nextState: NegotiationsState.ALL_REFUSED,   text: 'Нет, ты требуешь слишком многого.'},
                100: {nextState: NegotiationsState.BATTLE,       text: 'Убирайся прочь с дороги, мерзкое создание!'}
            },
            [EncounterDanger.LOW]:          {
                50: {nextState: NegotiationsState.ALL_GIVEN,     text: 'Ладно, тролль-грабитель, забирай все. Чтоб тебя!',},
                100: {nextState: NegotiationsState.ALL_REFUSED,  text: 'Отдать все до последнего? Ни за что!',}
            },
            [EncounterDanger.NONE]:         {
                90: {nextState: NegotiationsState.ALL_GIVEN,     text: 'Деваться некуда. Забирай все пожитки, безжалостное создание...',},
                100: {nextState: NegotiationsState.ALL_REFUSED,  text: 'Отдать все тебе и умереть от голода и холода? Ни за что! Лучше на месте ешь, хотя бы быстрее будет.',}
            },
        },
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]:   {
                100: {nextState: NegotiationsState.BATTLE,       text: 'Какая невероятная наглость. Уберем эту гадость с моста!'}
            },
            [EncounterDanger.VERY_HIGH]:    {
                33: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Так уж и быть, возьми плату и дай пройти.',},
                66: {nextState: NegotiationsState.PAY_REFUSED,   text: 'Ты ничего не получишь. Освободи путь!',},
                100: {nextState: NegotiationsState.BATTLE,       text: 'Что на нахальство! Это мост Короля, а не твой. Ну, берегись!'}
            },
            [EncounterDanger.HIGH]:         {
                50: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Ладно, вот твоя плата.'},
                75: {nextState: NegotiationsState.PAY_REFUSED,   text: 'Ты ничего не получишь. Уходи.'},
                100: {nextState: NegotiationsState.BATTLE,       text: 'Ты слишком много на себя берешь, нечестивое создание!',},
            },
            [EncounterDanger.MEDIUM]:       {
                66: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Справедливое требование. Держи оплату.',},
                90: {nextState: NegotiationsState.PAY_REFUSED,   text: 'Нет, платы ты не дождешься. Дай пройти!',},
                100: {nextState: NegotiationsState.BATTLE,       text: 'Чем отдавать тебе плату - лучше намять тебе бока!',},
            },
            [EncounterDanger.LOW]:          {
                80: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Да, конечно. Вот плата.',},
                100: {nextState: NegotiationsState.PAY_REFUSED,  text: 'Ты, конечно, страшен. Но платы тебе не видать.',},
            },
            [EncounterDanger.NONE]:         {
                90: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Конечно, вот, это твое.',},
                100: {nextState: NegotiationsState.PAY_REFUSED,  text: 'Отдать тебе последнее - ни за что! Отпусти, дай пройти! Иначе Бог покарает тебя!',},
            },
        },
        [NegotiationsMessage.TO_BATTLE]:   {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.BATTLE, text: 'Ха-ха, эта жалкая тварь собирается броситься!'}},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.BATTLE, text: 'Мезркая тварь, тебе не сдобровать.'}},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Злобный тролль, ты пожалеешь о том, что поднимаешь лапу на путников.'}},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.BATTLE, text: 'Ты получишь отпор, чудище!'}},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.BATTLE, text: 'Ааа, тролль атакует!'}},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Спасите! Кто-нибудь!'}},
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: 'Посторонись, отродье, а не то растопчем.'}},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'С дороги, тролль.'}},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Что это за зверь?'}},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Зеленый монстр не мешает, можно идти.'}},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Будь здоров, смотритель моста.'}},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Спасибо, что не тронул, добрый тролль.'}},
        }
    },
    [NegotiationsState.ALL_REFUSED]: {
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]:   {
                100: {nextState: NegotiationsState.BATTLE, text: 'Да как ты вообще смеешь! Сейчас поплатишься за дерзость!'},
            },
            [EncounterDanger.VERY_HIGH]:    {
                33: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Ладно, просто плату ты, так уж и быть, получишь.'},
                90: {nextState: NegotiationsState.PAY_REFUSED, text: 'Собираешься содрать хоть что-то? Не тут-то было. Убирайся с дороги!'},
                100: {nextState: NegotiationsState.BATTLE, text: 'Тебе был дан шанс, упрямая тварь!'},
            },
            [EncounterDanger.HIGH]:         {
                50: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Это еще куда ни шло. Держи и дай пройти.'},
                90: {nextState: NegotiationsState.PAY_REFUSED, text: 'И платы ты тоже не получишь.'},
                100: {nextState: NegotiationsState.BATTLE, text: 'Да что ты за наглое создание! Ну все, берегись!'},
            },
            [EncounterDanger.MEDIUM]:       {
                66: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Это более справедливое требование.'},
                100: {nextState: NegotiationsState.PAY_REFUSED, text: 'Нет, жадный тролль, ты не получишь и просто платы.'},
            },
            [EncounterDanger.LOW]:          {
                90: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Так бы сразу. Вот, это твое.'},
                100: {nextState: NegotiationsState.PAY_REFUSED, text: 'Тролль, будь добр, пропусти за так?'},
            },
            [EncounterDanger.NONE]:         {
                95: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Ох, ладно, тролль. Вот плата.'},
                100: {nextState: NegotiationsState.PAY_REFUSED, text: 'Не отнимай последнее, пожалуйста...'},
            },
        },
        [NegotiationsMessage.TO_BATTLE]:   {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.BATTLE, text: 'Сейчас поплатишься за дерзость!'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.BATTLE, text: 'Приготовься быть униженным!'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.BATTLE, text: 'Тролль атакует!'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Нет! Пожалуйста, не трогай!'},},
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'То-то же.'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Ну, значит, можно идти...'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
        },
    },
    [NegotiationsState.ALL_GIVEN]: {
        [NegotiationsMessage.TO_BATTLE]:   {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.BATTLE, text: 'Тварь обезумела!'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.BATTLE, text: 'Тварь обезумела!'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Тролль совсем обезумел!'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.BATTLE, text: 'Что за коварство?!'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.BATTLE, text: 'Ты чего, тролль?!'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Но почему?! За что?!'},},
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: '...'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'Твой счастливый день.'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Зеленый грабитель...'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Тебе это аукнется...'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Убратья бы отсюда поскорей...'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Как бы теперь не умереть с голоду...'},},
        },
    },
    [NegotiationsState.PAYMENT_GIVEN]: {
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: '...'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'В следующий раз не жди такой щедрости.'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Держи мост в порядке, тролль.'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Отличный мост, друг. Давай, не болей тут!'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Честная плата за честную троллью работу, верно? Хорошего дня!'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Хорошего дня, мистер тролль.'},},
        },
    },
    [NegotiationsState.PAY_REFUSED]: {
        [NegotiationsMessage.TO_BATTLE]:   {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.BATTLE, text: 'Сейчас поплатишься за дерзость!'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.BATTLE, text: 'Приготовься быть униженным!'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.BATTLE, text: 'Тролль атакует!'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Нет! Пожалуйста, не трогай!'},},
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'То-то же.'},},
            [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
            [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
            [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Ну, значит, можно идти... Фух.'},},
            [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
        },
    },
    // [NegotiationsState.ALL_AFTER_PAYMENT_REFUSED]: {
    //     [NegotiationsMessage.TO_BATTLE]:   {
    //         [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.BATTLE, text: 'Сейчас поплатишься за дерзость!'},},
    //         [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.BATTLE, text: 'Приготовься быть униженным!'},},
    //         [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
    //         [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.BATTLE, text: 'Тролль атакует!'},},
    //         [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
    //         [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.BATTLE, text: 'Нет! Пожалуйста, не трогай!'},},
    //     },
    //     [NegotiationsMessage.GO_IN_PEACE]: {
    //         [EncounterDanger.IMPOSSIBLE]:   {100: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
    //         [EncounterDanger.VERY_HIGH]:    {100: {nextState: NegotiationsState.END, text: 'То-то же.'},},
    //         [EncounterDanger.HIGH]:         {100: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
    //         [EncounterDanger.MEDIUM]:       {100: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
    //         [EncounterDanger.LOW]:          {100: {nextState: NegotiationsState.END, text: 'Бывай, зеленый.'},},
    //         [EncounterDanger.NONE]:         {100: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
    //     },
    // },
    [NegotiationsState.BATTLE]: {},
    [NegotiationsState.END]: {},
}