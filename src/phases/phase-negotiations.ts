import {GamePhase} from "./game-phase";
import {eventBus, Evt} from "../event-bus";
import {o_} from "../managers/locator";
import {O_Container} from "../managers/core/render/container";
import {positioner} from "../managers/game/positioner";
import {LayerKey} from "../managers/core/layers";
import {EncounterDanger, NegotiationsMessage} from "../types";
import {pause} from "../utils/utils-async";
import {NegotiationMenu} from "../interface/negotiation-menu";
import {rnd} from "../utils/utils-math";
import {trollConfig} from "../configs/troll-config";
import {PhaseBridge} from "./phase-bridge";

export const enum NegotiationsState {
    START = 'START',
    ALL_GIVEN = 'ALL_GIVEN',
    PAYMENT_GIVEN = 'PAYMENT_GIVEN',
    ALL_REFUSED = 'ALL_REFUSED',
    PAY_REFUSED = 'PAY_REFUSED',
    BATTLE = 'BATTLE',
    END = 'END'
}

const BUTTON_WIDTH = 200;
const BUTTON_MARGIN = 30;

const getButtonsRowWidth = (amount: number) => amount * BUTTON_WIDTH + (amount - 1) * BUTTON_MARGIN;

export class PhaseNegotiations extends GamePhase {

    name = "talk"

    container!: O_Container

    currentStateKey = NegotiationsState.END;

    danger: EncounterDanger = EncounterDanger.NONE;

    encounterState: any

    travellersReadyToTalk = [] as string[];

    onStart() {
        const bridgePos = positioner.getBridgePosition()
        this.container = o_.render.createContainer(bridgePos.x + bridgePos.width / 2, bridgePos.y + bridgePos.height - 64)
        o_.layers.add(this.container, LayerKey.FIELD_BUTTONS)

        eventBus.on(Evt.CHAR_READY_TO_TALK, id => this.onTravellerReadyToTalk(id));

        o_.troll.goToBattlePosition()
        o_.characters.setPrisonersInteractive(false)
        o_.characters.travellersGoToTalk();

        eventBus.emit(Evt.ENCOUNTER_STARTED);
    }

    onTravellerReadyToTalk(id: string) {
        this.travellersReadyToTalk.push(id);
        if (this.travellersReadyToTalk.length === o_.characters.getTravellers().length) {
            this.travellersReadyToTalk = [];
            console.log('===========================')
            console.log('encounterLevel', o_.characters.encounterLevel, 'danger', o_.characters.getDangerKey())
            console.log('===========================')
            this.startNegotiations(o_.characters.getDangerKey());
        }
    }

    onStateChange(travellersReaction: string = '') {
        switch (this.currentStateKey) {
            case NegotiationsState.START:
                o_.characters.stopAllTravellers();
                break;
            case NegotiationsState.ALL_GIVEN:
                o_.characters.makeAllTravellersGiveAll();
                pause(700).then(() => {
                    o_.troll.laughHard()
                    o_.troll.addXpForCurrentFighters(0.75)
                })
                break;
            case NegotiationsState.PAYMENT_GIVEN:
                o_.characters.makeAllTravellersPay();
                pause(700).then(() => {
                    o_.troll.laugh()
                    o_.troll.addXpForCurrentFighters(0.5)
                })
                break;
            case NegotiationsState.BATTLE:
                // TODO
                // o_.battle.startBattle()
                break;
            case NegotiationsState.END:
                this.goToNextPhase(new PhaseBridge())
                break;
            case NegotiationsState.ALL_REFUSED:
            case NegotiationsState.PAY_REFUSED:
                o_.troll.hmm()
                break;
        }
        if (travellersReaction) o_.characters.travellersSpeak(travellersReaction);
        this.updateDialogButtons();
    }

    negotiationMenu = new NegotiationMenu([], (message: NegotiationsMessage) => this.onMessage(message))

    updateDialogButtons() {
        this.negotiationMenu.hide().then(() => {
            if (!this.encounterState) {
                return;
            }

            const answers = this.getDialogVariants();
            this.negotiationMenu.show(answers)
        })
    }

    startNegotiations(danger: EncounterDanger) {
        if (o_.characters.isVigilante) {
            this.currentStateKey = NegotiationsState.BATTLE
            this.onStateChange()
            return
        }

        this.danger = danger;
        this.currentStateKey = NegotiationsState.START

        const tree = o_.characters.isKing ? kingNegotiationTree : negotiationTree
        this.encounterState = tree[this.currentStateKey]
        this.onStateChange()

        if (o_.characters.isKing) {
            o_.characters.travellersSpeak('Прочь с пути, тролль!')
        } else {
            o_.characters.travellersSpeak(wordsOnStart[danger][100])
        }
    }

    getDialogVariants(): NegotiationsMessage[] {
        return Object.keys(this.encounterState) as NegotiationsMessage[];
    }

    onMessage(message: NegotiationsMessage) {
        const roll = rnd() * 100;

        console.log('onMessage roll', roll)

        if (!this.encounterState[message]) {
            throw Error('wrong message ' + message)
        }

        if (
            message === NegotiationsMessage.GO_IN_PEACE
            && (this.currentStateKey === NegotiationsState.PAY_REFUSED || this.currentStateKey === NegotiationsState.ALL_REFUSED)
        ) {
            o_.troll.changeFear(trollConfig.FEAR_CHANGES.LET_PASS_AFTER_ASKING)
        }

        if (message === NegotiationsMessage.DEMAND_PAY && (this.currentStateKey === NegotiationsState.ALL_REFUSED)) {
            o_.troll.changeFear(trollConfig.FEAR_CHANGES.ASK_PAY_AFTER_ALL_REFUSED)
        }

        if (message === NegotiationsMessage.GO_IN_PEACE && this.currentStateKey === NegotiationsState.START) {
            o_.troll.changeFear(trollConfig.FEAR_CHANGES.LET_PASS)
        }

        const edges = this.encounterState[message][this.danger]
        const edgeNumericKeys = Object.keys(edges)
            .filter(key => key !== 'default')
            .sort((a, b) => +a - +b);

        const fearBonus = o_.troll.fear * trollConfig.FEAR_FACTOR

        console.log('edges', edges, edgeNumericKeys, 'fearBonus', fearBonus)

        let edgeKey: number | 'default' = 'default'

        for (let i = 0; i < edgeNumericKeys.length; i++) {
            const chance = +edgeNumericKeys[i] + fearBonus
            if (roll <= chance) {
                edgeKey = +edgeNumericKeys[i]
                break;
            }
        }

        console.log('new state key', edgeKey)

        this.currentStateKey = edges[edgeKey].nextState;

        const tree = o_.characters.isKing ? kingNegotiationTree : negotiationTree
        this.encounterState = tree[this.currentStateKey];

        this.onStateChange(edges[edgeKey].text);
    }

    goToLairPhase = () => {

    }

    protected onEnd() {
        this.encounterState = null

        this.negotiationMenu.hide()

        o_.characters.allTravelersGoAcrossBridge()
    }
}

type NegotiationTree = {
    [encounterStateKey in NegotiationsState]: {
        [messageKey in NegotiationsMessage]?: {
            [dangerKey in EncounterDanger]: {
                [key: number]: { nextState: NegotiationsState, text: string }
                default: { nextState: NegotiationsState, text: string }
            }
        }
    };
};

const wordsOnStart = {
    [EncounterDanger.IMPOSSIBLE]: {
        100: 'Что за наглое отродье вылезло на дорогу?'
    },
    [EncounterDanger.VERY_HIGH]: {
        100: 'Мерзкое создание. Убирайся с пути.'
    },
    [EncounterDanger.HIGH]: {
        100: 'Зеленая тварь. Что ты хочешь?'
    },
    [EncounterDanger.MEDIUM]: {
        100: 'Что тебе надобно, тролль?'
    },
    [EncounterDanger.LOW]: {
        100: 'Опасное создание! Что же делать?..'
    },
    [EncounterDanger.NONE]: {
        100: 'Кошмар... Это конец!'
    },
}

const kingNegotiationTree: NegotiationTree = {
    [NegotiationsState.START]: {
        [NegotiationsMessage.DEMAND_ALL]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Не смеши Короля, зеленый зверь.'
                }
            },
        },
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Требуешь платы от самого Его Величества? Ты обезумел?'
                }
            },
        },
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
        },
    },
    [NegotiationsState.ALL_REFUSED]: {
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Какая невероятная наглость!'
                }
            },
        },
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
        },
    },
    [NegotiationsState.PAY_REFUSED]: {
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Успокоить это злобное создание!'
                },
            },
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
        },
    },
    [NegotiationsState.ALL_GIVEN]: {},
    [NegotiationsState.PAYMENT_GIVEN]: {},
    [NegotiationsState.BATTLE]: {},
    [NegotiationsState.END]: {},
}

const negotiationTree: NegotiationTree = {
    [NegotiationsState.START]: {
        [NegotiationsMessage.DEMAND_ALL]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {nextState: NegotiationsState.BATTLE, text: 'Что эта тварь бормочет? Проучить ее!'}
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Монстр, ты оскорбил нас таким наглым требованием. И сейчас ты за это заплатишь!'
                }
            },
            [EncounterDanger.HIGH]: {
                [50]: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Ты слишком многого хочешь, тролль. Пропусти нас сейчас же!'
                },
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'За кого ты нас принимаешь, тролль? Как ты посмел? Мы заставим тебя молить о прощении!'
                }
            },
            [EncounterDanger.MEDIUM]: {
                [10]: {
                    nextState: NegotiationsState.ALL_GIVEN,
                    text: 'Невероятна жадность твоя. Ладно, забирай все и дай пройти.'
                },
                [60]: {nextState: NegotiationsState.ALL_REFUSED, text: 'Нет, ты требуешь слишком многого.'},
                default: {nextState: NegotiationsState.BATTLE, text: 'Убирайся прочь с дороги, мерзкое создание!'}
            },
            [EncounterDanger.LOW]: {
                [20]: {
                    nextState: NegotiationsState.ALL_GIVEN,
                    text: 'Ладно, тролль-грабитель, забирай все. Чтоб тебя!',
                },
                default: {nextState: NegotiationsState.ALL_REFUSED, text: 'Отдать все до последнего? Ни за что!',}
            },
            [EncounterDanger.NONE]: {
                [75]: {
                    nextState: NegotiationsState.ALL_GIVEN,
                    text: 'Деваться некуда. Забирай все пожитки, безжалостное создание...',
                },
                default: {
                    nextState: NegotiationsState.ALL_REFUSED,
                    text: 'Отдать все тебе и умереть от голода и холода? Ни за что! Лучше на месте ешь, хотя бы быстрее будет.',
                }
            },
        },
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Какая невероятная наглость. Уберем эту гадость с моста!'
                }
            },
            [EncounterDanger.VERY_HIGH]: {
                [10]: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Так уж и быть, возьми плату и дай пройти.',},
                [70]: {nextState: NegotiationsState.PAY_REFUSED, text: 'Ты ничего не получишь. Освободи путь!',},
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Что на нахальство! Это мост Короля, а не твой. Ну, берегись!'
                }
            },
            [EncounterDanger.HIGH]: {
                [20]: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Ладно, вот твоя плата.'},
                [80]: {nextState: NegotiationsState.PAY_REFUSED, text: 'Ты ничего не получишь. Уходи.'},
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Ты слишком много на себя берешь, нечестивое создание!',
                },
            },
            [EncounterDanger.MEDIUM]: {
                [40]: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Справедливое требование. Держи оплату.',},
                [80]: {nextState: NegotiationsState.PAY_REFUSED, text: 'Нет, платы ты не дождешься. Дай пройти!',},
                default: {nextState: NegotiationsState.BATTLE, text: 'Пожалуй, лучше будет намять тебе бока!',},
            },
            [EncounterDanger.LOW]: {
                [75]: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Да, конечно. Вот плата.',},
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Ты, конечно, страшен. Но платы тебе не видать.',
                },
            },
            [EncounterDanger.NONE]: {
                [90]: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Конечно, вот, это твое.',},
                default: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Отдать тебе последнее - ни за что! Отпусти, дай пройти! Иначе Бог покарает тебя!',
                },
            },
        },
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Ха-ха, эта жалкая тварь собирается броситься!'
                }
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Мерзкая тварь, тебе не сдобровать.'
                }
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Злобный тролль, ты пожалеешь о том, что поднимаешь лапу на путников.'
                }
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Ты получишь отпор, чудище!'
                }
            },
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.BATTLE, text: 'Ааа, тролль нападает!'}},
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.BATTLE, text: 'Спасите! Кто-нибудь!'}},
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Посторонись, отродье, а не то растопчем.'
                }
            },
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'С дороги, тролль.'}},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Что это за зверь?'}},
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Зеленый монстр не мешает, можно идти.'
                }
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Будь здоров, смотритель моста.'
                }
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Спасибо, что не тронул, добрый тролль.'
                }
            },
        }
    },
    [NegotiationsState.ALL_REFUSED]: {
        [NegotiationsMessage.DEMAND_PAY]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Да как ты вообще смеешь! Сейчас поплатишься за дерзость!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                [5]: {
                    nextState: NegotiationsState.PAYMENT_GIVEN,
                    text: 'Ладно, просто плату ты, так уж и быть, получишь.'
                },
                [65]: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Собираешься содрать хоть что-то? Не тут-то было. Убирайся с дороги!'
                },
                default: {nextState: NegotiationsState.BATTLE, text: 'Тебе был дан шанс, упрямая тварь!'},
            },
            [EncounterDanger.HIGH]: {
                10: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Это еще куда ни шло. Держи и дай пройти.'},
                75: {nextState: NegotiationsState.PAY_REFUSED, text: 'И платы ты тоже не получишь.'},
                default: {nextState: NegotiationsState.BATTLE, text: 'Да что ты за наглое создание! Ну все, берегись!'},
            },
            [EncounterDanger.MEDIUM]: {
                20: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Это более справедливое требование.'},
                60: {
                    nextState: NegotiationsState.PAY_REFUSED,
                    text: 'Нет, жадный тролль, ты не получишь и просто платы.'
                },
                default: {nextState: NegotiationsState.BATTLE, text: 'Да что ты за наглое создание! Ну все, берегись!'},
            },
            [EncounterDanger.LOW]: {
                75: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Так бы сразу. Вот, это твое.'},
                default: {nextState: NegotiationsState.PAY_REFUSED, text: 'Тролль, будь добр, пропусти за так?'},
            },
            [EncounterDanger.NONE]: {
                75: {nextState: NegotiationsState.PAYMENT_GIVEN, text: 'Ох, ладно, тролль. Вот плата.'},
                default: {nextState: NegotiationsState.PAY_REFUSED, text: 'Не отнимай последнее, пожалуйста...'},
            },
        },
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Сейчас поплатишься за дерзость!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Приготовься быть униженным!'
                },
            },
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.BATTLE, text: 'Тролль нападает!'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Нет! Пожалуйста, не трогай!'
                },
            },
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'То-то же.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.END, text: 'Ну, значит, можно идти...'},},
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
        },
    },
    [NegotiationsState.ALL_GIVEN]: {
        // [NegotiationsMessage.TO_BATTLE]:   {
        //     [EncounterDanger.IMPOSSIBLE]:   {default: {nextState: NegotiationsState.BATTLE, text: 'Тварь обезумела!'},},
        //     [EncounterDanger.VERY_HIGH]:    {default: {nextState: NegotiationsState.BATTLE, text: 'Тварь обезумела!'},},
        //     [EncounterDanger.HIGH]:         {default: {nextState: NegotiationsState.BATTLE, text: 'Тролль совсем обезумел!'},},
        //     [EncounterDanger.MEDIUM]:       {default: {nextState: NegotiationsState.BATTLE, text: 'Что за коварство?!'},},
        //     [EncounterDanger.LOW]:          {default: {nextState: NegotiationsState.BATTLE, text: 'Ты чего, тролль?!'},},
        //     [EncounterDanger.NONE]:         {default: {nextState: NegotiationsState.BATTLE, text: 'Но почему?! За что?!'},},
        // },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: '...'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'Твой счастливый день.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Зеленый грабитель...'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Тебе это аукнется...'},},
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Убратья бы отсюда поскорей...'
                },
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Как бы теперь не умереть с голоду...'
                },
            },
        },
    },
    [NegotiationsState.PAYMENT_GIVEN]: {
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: '...'},},
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'В следующий раз не жди такой щедрости.'
                },
            },
            [EncounterDanger.HIGH]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Держи мост в порядке, тролль.'
                },
            },
            [EncounterDanger.MEDIUM]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Отличный мост, друг. Давай, не болей тут!'
                },
            },
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Честная плата за честную троллью работу, верно? Хорошего дня!'
                },
            },
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Хорошего дня, мистер тролль.'
                },
            },
        },
    },
    [NegotiationsState.PAY_REFUSED]: {
        [NegotiationsMessage.TO_BATTLE]: {
            [EncounterDanger.IMPOSSIBLE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Сейчас поплатишься за дерзость!'
                },
            },
            [EncounterDanger.VERY_HIGH]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Приготовься быть униженным!'
                },
            },
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.BATTLE, text: 'Тролль нападает!'},},
            [EncounterDanger.LOW]: {default: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
            [EncounterDanger.NONE]: {
                default: {
                    nextState: NegotiationsState.BATTLE,
                    text: 'Нет! Пожалуйста, не трогай!'
                },
            },
        },
        [NegotiationsMessage.GO_IN_PEACE]: {
            [EncounterDanger.IMPOSSIBLE]: {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
            [EncounterDanger.VERY_HIGH]: {default: {nextState: NegotiationsState.END, text: 'То-то же.'},},
            [EncounterDanger.HIGH]: {default: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
            [EncounterDanger.MEDIUM]: {default: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
            [EncounterDanger.LOW]: {
                default: {
                    nextState: NegotiationsState.END,
                    text: 'Ну, значит, можно идти... Фух.'
                },
            },
            [EncounterDanger.NONE]: {default: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
        },
    },
    // [NegotiationsState.ALL_AFTER_PAYMENT_REFUSED]: {
    //     [NegotiationsMessage.TO_BATTLE]:   {
    //         [EncounterDanger.IMPOSSIBLE]:   {default: {nextState: NegotiationsState.BATTLE, text: 'Сейчас поплатишься за дерзость!'},},
    //         [EncounterDanger.VERY_HIGH]:    {default: {nextState: NegotiationsState.BATTLE, text: 'Приготовься быть униженным!'},},
    //         [EncounterDanger.HIGH]:         {default: {nextState: NegotiationsState.BATTLE, text: 'Ты будешь повержен!'},},
    //         [EncounterDanger.MEDIUM]:       {default: {nextState: NegotiationsState.BATTLE, text: 'Тролль атакует!'},},
    //         [EncounterDanger.LOW]:          {default: {nextState: NegotiationsState.BATTLE, text: 'Ой-ей!'},},
    //         [EncounterDanger.NONE]:         {default: {nextState: NegotiationsState.BATTLE, text: 'Нет! Пожалуйста, не трогай!'},},
    //     },
    //     [NegotiationsMessage.GO_IN_PEACE]: {
    //         [EncounterDanger.IMPOSSIBLE]:   {default: {nextState: NegotiationsState.END, text: 'Прочь с дороги.'},},
    //         [EncounterDanger.VERY_HIGH]:    {default: {nextState: NegotiationsState.END, text: 'То-то же.'},},
    //         [EncounterDanger.HIGH]:         {default: {nextState: NegotiationsState.END, text: 'Освободи путь.'},},
    //         [EncounterDanger.MEDIUM]:       {default: {nextState: NegotiationsState.END, text: 'Сразу бы так.'},},
    //         [EncounterDanger.LOW]:          {default: {nextState: NegotiationsState.END, text: 'Бывай, зеленый.'},},
    //         [EncounterDanger.NONE]:         {default: {nextState: NegotiationsState.END, text: 'Спасибо, что не злишься.'},},
    //     },
    // },
    [NegotiationsState.BATTLE]: {},
    [NegotiationsState.END]: {},
}