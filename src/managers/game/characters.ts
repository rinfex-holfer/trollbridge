import {CharKey, EncounterDanger, SquadPlace, TrollLocation} from "../../types";
import {clamp, getRndItem, rnd, rndBetween} from "../../utils/utils-math";
import {Char, CharBehavior} from "../../entities/char/char";
import {eventBus, Evt} from "../../event-bus";
import {encounterTemplates, maxEncounterLevel, vigilanteEncounters} from "../../encounter-templates";
import {positioner} from "./positioner";
import {o_} from "../locator";
import {DmgOptions} from "../../utils/utils-types";
import {Squad} from "./squad";
import {EntityType} from "../core/entities";
import {Gold, GoldLocation} from "../../entities/gold";
import {pause} from "../../utils/utils-async";
import {MeatLocation} from "../../entities/meat";

export class CharactersManager {
    chars: Char[] = []

    encounterLevel: number = 0;

    // dangerIndicator: DangerIndicator

    squad = new Squad([])

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

        const bridgePos = positioner.bridgePosition();
        const x = bridgePos.x + bridgePos.width;
        const y = 0;
        // this.dangerIndicator = new DangerIndicator(x, y)

        o_.time.sub(dt => this.update(dt))
        o_.register.characters(this);
    }

    onTrollLocationChanged(location: TrollLocation) {
        if (location === TrollLocation.LAIR) {
            this.letAllTravellersPass();
        }
    }

    getSquadChars() {
        return this.squad.chars
    }

    createRandomEncounter() {
        // 0 - 40 troll level
        // 41 - 80 - lower
        // 81 - 95 - 1-2 higher
        // 96-100 - 3 higher

        let rndLevel: number

        console.log('Create random encounter');

        const roll = rnd()
        console.log('encounter roll', roll, ', encounter level:')
        if (roll <= 0.4) {
            rndLevel = o_.troll.level
            console.log('exact troll level', rndLevel)
        } else if (roll <= 0.8) {
            rndLevel = rndBetween(0, o_.troll.level - 1)
            console.log('lower', rndLevel)
        } else if (roll <= 0.95) {
            rndLevel = rndBetween(o_.troll.level + 1, o_.troll.level + 2)
            console.log('higher', rndLevel)
        } else {
            rndLevel = o_.troll.level + 3
            console.log('highest possible', rndLevel)
        }

        // if (o_.troll.fear >= gameConstants.FEAR_FOR_VIGILANTE && roll > 0.9) {
        if (true) {
            console.log('vigilante encounter!')
            const vigilanteEncounter = vigilanteEncounters[this.nextVigilanteEncounter++]
            if (vigilanteEncounter) {
                this.encounterLevel = 999
                this.isVigilante = true
                this.createTravellers(vigilanteEncounter.enemies, CharBehavior.VIGILANTE)
                o_.interaction.disableEverything()
                o_.troll.goToBridge()
                this.travellersSpeak(vigilanteEncounter.greetText || '')
                return
            }
        }
        this.isVigilante = false

        rndLevel = clamp(rndLevel, 0, maxEncounterLevel)
        console.log('after clamp', rndLevel)

        const encounter = getRndItem(encounterTemplates[rndLevel]);

        this.encounterLevel = rndLevel
        this.createTravellers(encounter.enemies)

        // this.dangerIndicator.setDanger(this.getDangerKey(), encounter.text);
    }

    nextVigilanteEncounter = 0
    isVigilante = false

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
        const bridgePos = positioner.bridgePosition()

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

    getNewTravellers() { return this.chars.filter(c => c.getIsNewTraveller())}
    getTravellers() { return this.chars.filter(c => c.getIsTraveller())}
    getTravellersAfterBattle() { return this.chars.filter(c => c.getIsTraveller() && !c.isReleased)}
    getFighters() { return this.chars.filter(c => c.getIsAbleToFight())}
    getPrisoners() { return this.chars.filter(c => c.getIsPrisoner())}

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

    letAllTravellersPass() {
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
    }

    travellersTakeResourcesOnBridge() {
        let start = 0

        const travellers = o_.characters.getTravellers()
        const promises = o_.entities
            .get(EntityType.GOLD)
            .filter(g => g.location === GoldLocation.GROUND)
            .map(g => {
                return pause((start++) * 50).then(() => getRndItem(travellers).takeGold(g))
            })

        o_.entities
            .get(EntityType.MEAT)
            .filter(m => m.location === MeatLocation.GROUND && !m.props.isStale && !m.props.isHuman)
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