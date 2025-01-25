import {CharKey, EncounterDanger, SquadPlace, TrollLocation} from "../../types";
import {clamp, getRndItem, rnd, rndBetween} from "../../utils/utils-math";
import {Char, CharBehavior} from "../../entities/char/char";
import {eventBus, Evt} from "../../event-bus";
import {encounterTemplates, kingSquad, maxEncounterLevel, vigilanteEncounters} from "../../encounter-templates";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {DmgOptions} from "../../utils/utils-types";
import {Squad} from "./squad";
import {Gold, GoldLocation} from "../../entities/items/gold";
import {pause} from "../../utils/utils-async";
import {MeatLocation} from "../../entities/items/meat/meat";
import {trollConfig} from "../../configs/troll-config";
import {TrollFearLevel} from "./troll/types";
import {debugExpose} from "../../utils/utils-misc";

import {ItemType} from "../../entities/items/types";
import {SaveData} from "../save-manager";

export class CharactersManager {
    chars: Char[] = []

    encounterLevel: number = 0;

    // dangerIndicator: DangerIndicator

    squad = new Squad([])

    vigilanteTimeLeft = 0
    vigilantePlanned = false
    nextVigilanteEncounter = 0
    isVigilante = false
    isKing = false

    constructor() {
        eventBus.on(Evt.CHAR_LEFT_BRIDGE, charId => this.onCharLeftBridge(charId))
        eventBus.on(Evt.TIME_PASSED, () => {
            this.chars.forEach(t => {
                if (t.isPrisoner) t.timeWithoutFood++
            })
        })
        eventBus.on(Evt.TIME_PASSED, () => {
            this.removeTravellers()
            this.createRandomEncounter()
        });
        eventBus.on(Evt.TROLL_LOCATION_CHANGED, l => this.onTrollLocationChanged(l));

        const bridgePos = positioner.getBridgePosition();
        const x = bridgePos.x + bridgePos.width;
        const y = 0;
        // this.dangerIndicator = new DangerIndicator(x, y)

        o_.time.sub(dt => this.update(dt))
        o_.register.characters(this);

        debugExpose((t: number) => this.planVigilante(t), 'planVigilante')
    }

    reset(saveData?: SaveData) {
        this.chars.forEach(c => c.destroy())
        this.chars = []
        this.squad = new Squad([])
        this.vigilanteTimeLeft = 0
        this.vigilantePlanned = false
        this.nextVigilanteEncounter = 0
        this.isVigilante = false
        this.isKing = false
    }

    onTrollLocationChanged(location: TrollLocation) {
        if (location === TrollLocation.LAIR) {
            this.allTravelersGoAcrossBridge();
        }
    }

    getSquadChars() {
        return this.squad.chars
    }

    log(...args: any) {
        // console.log(...args)
    }

    createRandomEncounter() {
        // 0 - 40 troll level
        // 41 - 80 - lower
        // 81 - 95 - 1-2 higher
        // 96-100 - 3 higher
        // this.log('Create random encounter');

        const roll = rnd()

        // this.log('vigilantePlanned', this.vigilantePlanned)
        // this.log('vigilante may be planned', o_.troll.fearLevel === TrollFearLevel.HORRIFIC, vigilanteEncounters[this.nextVigilanteEncounter + 1])
        if (this.vigilantePlanned) {
            this.vigilanteTimeLeft--
            this.log('time till vigilante comes:', this.vigilanteTimeLeft)
            if (this.vigilanteTimeLeft <= 0) {
                throw Error('Vigilante TODO')
                // this.vigilantePlanned = false
                //
                // const vigilanteEncounter = vigilanteEncounters[this.nextVigilanteEncounter++]
                // this.log('vigilante appears!')
                // this.encounterLevel = 999
                // this.isVigilante = true
                // this.createTravellers(vigilanteEncounter.enemies, CharBehavior.VIGILANTE)
                // // o_.interaction.disableEverything()
                // o_.troll.goToBridge()
                // this.travellersSpeak(vigilanteEncounter.greetText || '')
                // return
            }
        } else if (o_.troll.fearLevel === TrollFearLevel.HORRIFIC && vigilanteEncounters[this.nextVigilanteEncounter]) {
            this.log('check to plan vigilante')
            if (roll > 0.9) {
                this.planVigilante(3)
            }
        }

        this.isVigilante = false


        let rndLevel: number

        this.log('encounter roll', roll, ', encounter level:')

        if (roll <= 0.4) {
            rndLevel = o_.troll.level
            this.log('======= exact troll level', rndLevel)
        } else if (roll <= 0.8) {
            rndLevel = rndBetween(0, o_.troll.level - 1)
            this.log('======= lower', rndLevel)
        } else if (roll <= 0.95) {
            rndLevel = rndBetween(o_.troll.level + 1, o_.troll.level + 2)
            this.log('======= higher', rndLevel)
        } else {
            rndLevel = o_.troll.level + 3
            this.log('======= highest possible', rndLevel)
        }

        rndLevel = clamp(rndLevel, 0, maxEncounterLevel)
        this.log('after clamp', rndLevel)

        let encounter = getRndItem(encounterTemplates[rndLevel]);

        if (o_.bridge.isWithStatues && roll <= 0.8 && roll >= 0.7) {
            this.encounterLevel = 999
            this.isKing = true
            encounter = kingSquad
            this.log('King encounter')
        } else {
            this.isKing = false
        }

        this.encounterLevel = rndLevel
        this.createTravellers(encounter.enemies)

        this.travellersSpeak(encounter.greetText || '')

        // this.dangerIndicator.setDanger(this.getDangerKey(), encounter.text);
    }

    planVigilante(time: number) {
        this.vigilantePlanned = true
        this.vigilanteTimeLeft = time
        this.log('vigilante planned')

        eventBus.emit(Evt.VIGILANTE_PLANNED, this.vigilanteTimeLeft)
    }

    update(dt: number) {
        this.chars.forEach(t => t.update(dt));
    }

    onCharLeftBridge(charId: string) {
        const traveller = this.chars.find(t => t.id === charId);
        if (!traveller) {
            console.error('no char with id ' + charId);
            return;
        }

        this.removeChar(charId);

        if (this.getTravellers().length === 0) {
            // this.dangerIndicator.clearDanger();
        }
    }

    charEaten(id: string) {
        const idx = this.chars.findIndex(t => t.id === id)
        if (idx === undefined) {
            console.error('no char with id ' + id)
            return;
        }

        this.chars[idx].becomeDevoured();
    }

    charToBones(id: string) {
        const idx = this.chars.findIndex(t => t.id === id)
        if (idx === undefined) {
            console.error('no char with id ' + id)
            return;
        }

        this.chars[idx].toBones();
    }

    removeChar(id: string) {
        const idx = this.chars.findIndex(t => t.id === id)
        if (idx === undefined) {
            console.error('no char with id ' + id)
            return;
        }

        this.chars[idx].destroy()
        this.chars.splice(idx, 1)[0]
    }

    createTravellers(keys: [SquadPlace, CharKey][], behavior?: CharBehavior) {
        const bridgePos = positioner.getBridgePosition()

        const startY = bridgePos.height / 5 + bridgePos.y + bridgePos.height / 5
        const marginY = bridgePos.height / 5;

        const startX = bridgePos.x + bridgePos.width - 50
        const marginX = marginY

        const c = keys.map(([place, key]) => {
            const x = place <= 2 ? startX : startX + marginX
            const y = startY + (place % 3) * marginY
            const char = new Char(key, x, y, behavior);
            this.chars.push(char);

            return [place, char]
        }) as [SquadPlace, Char][]

        this.squad = new Squad(c)

        if (behavior === CharBehavior.VIGILANTE) {
            this.squad.chars.forEach(c => c.goToTalk())
        }

        eventBus.emit(Evt.TRAVELLERS_APPEAR);
    }

    removeTravellers() {
        this.getTravellers().map(t => this.removeChar(t.id))
    }

    getDangerKey() {
        if (this.encounterLevel === 0) return EncounterDanger.NONE;
        const diff = o_.troll.level - this.encounterLevel;

        if (diff > 1) return EncounterDanger.LOW;
        else if (diff === 1) return EncounterDanger.LOW;
        else if (diff === 0) return EncounterDanger.MEDIUM;
        else if (diff === -1) return EncounterDanger.HIGH;
        else if (diff === -2) return EncounterDanger.VERY_HIGH;
        else return EncounterDanger.IMPOSSIBLE;
    }

    travellersSpeak(text: string) {
        return this.getTravellers()[0].speak(text);
    }

    getNewTravellers() {
        return this.chars.filter(c => c.getIsNewTraveller())
    }

    getTravellers() {
        return this.chars.filter(c => c.getIsTraveller())
    }

    getTravellersAfterBattle() {
        return this.chars.filter(c => c.getIsTraveller() && !c.isReleased)
    }

    getFighters() {
        return this.chars.filter(c => c.getIsAbleToFight())
    }

    getPrisoners() {
        return this.chars.filter(c => c.getIsPrisoner())
    }

    getTraveller(id: string) {
        const char = this.chars.find(t => t.id === id)
        if (!char) throw Error('WTF')

        return char
    }

    travellersGoToTalk() {
        this.getNewTravellers().forEach(t => t.goToTalk());
    }

    stopAllTravellers() {
        // this.getNewTravellers().forEach(t => t.startNegotiation());
    }

    allSurrender() {
        this.getTravellers().forEach(t => t.surrender());
    }

    allTravelersGoAcrossBridge() {
        this.getTravellers().forEach(t => t.goAcrossBridge());
        // this.dangerIndicator.clearDanger();
    }

    startFighting() {
        this.getTravellers().forEach(t => t.startFighting());
    }

    makeAllTravellersPay() {
        let gold = [] as Gold[]
        this.getTravellers().forEach(t => {
            gold = gold.concat(t.giveGoldPayment())
            t.payFood()
        });
        o_.lair.treasury.gatherGold(gold)
    }

    makeAllTravellersGiveAll() {
        let gold = [] as Gold[]
        this.getTravellers().forEach(t => {
            gold = gold.concat(t.giveGold(t.gold))
            t.dropFood(t.food, true)
        });
        o_.lair.treasury.gatherGold(gold)

        o_.troll.changeFear(trollConfig.FEAR_CHANGES.ALL_GIVEN)
    }

    travellersTakeResourcesOnBridge() {
        let start = 0

        const travellers = o_.characters.getTravellers()
        const promises = o_.items
            .get(ItemType.GOLD)
            .map(g => {
                return pause((start++) * 50).then(() => getRndItem(travellers).takeGold(g))
            })

        o_.items
            .get(ItemType.MEAT)
            .filter(m => m.data.location === MeatLocation.GROUND && !m.data.isStale && !m.data.isHuman)
            .forEach(m => {
                promises.push(pause((start++) * 50).then(() => getRndItem(travellers).takeMeat(m)))
            })

        return Promise.all(promises)
    }

    releaseChar(char: Char) {
        char.release()
    }

    makeImprisoned(id: string) {
        this.chars.find(t => t.id === id)?.makeImprisoned();
    }

    makeCharGiveAll(char: Char) {
        o_.troll.changeFear(Math.ceil(trollConfig.FEAR_CHANGES.ALL_GIVEN / this.squad.initialSize))
        char.giveAll();
    }

    makeCharPay(char: Char) {
        char.pay();
    }

    killChar(char: Char) {
        char.getKilled();
    }

    feedChar(id: string) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.eat();
    }

    hitChar(id: string, dmg: number, options?: DmgOptions) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.getHit(dmg, options);
    }

    transformToFood(char: Char) {
        char.tornApart()
    }

    disableInteractivityAll() {
        this.chars.forEach(f => f.disableInteractivity())
    }

    enableInteractivityAll() {
        this.chars.forEach(f => f.enableInteractivity())
    }

    enableInteractivityOnBridge() {
        this.chars.forEach(c => {
            if (!c.isPrisoner) c.enableInteractivity()
        })
    }

    setPrisonersInteractive(val: boolean) {
        this.getPrisoners().forEach(p => val ? p.enableInteractivity() : p.disableInteractivity())
    }

    counterAttack(charId: string) {
        const fighters = this.getFighters()
        let char = fighters.find(t => t.id === charId);
        if (!char) throw Error('wtf');

        return char.performCounterAttack()
    }

    canCounterAttack(charId: string) {
        const fighters = this.getFighters()
        let char = fighters.find(t => t.id === charId);
        if (!char) throw Error('wtf');

        return char.canCounterAttack()
    }

    getDefenderOf(char: Char) {
        return this.squad.getDefenderOf(char)
    }
}