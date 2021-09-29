import {CharKey, EncounterDanger, TrollLocation} from "../../types";
import {getRndItem} from "../../utils/utils-math";
import {Char} from "../../entities/char/Char";
import {eventBus, Evt} from "../../event-bus";
import {encounterTemplates} from "../../encounter-templates";
import {positioner} from "./positioner";
import {o_} from "../locator";

export class CharactersManager {
    chars: Char[] = []

    encounterLevel: number = 0;

    // dangerIndicator: DangerIndicator

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

    createRandomEncounter() {
        // const rnd = rndBetween(Math.max(0, gameState.troll.level - 1), gameState.troll.level + 1);
        const rnd = 0;
        const encounter = getRndItem(encounterTemplates[rnd]);

        this.createTravellers(encounter.enemies, encounter.level)

        // this.dangerIndicator.setDanger(this.getDangerKey(), encounter.text);
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

        this.chars[idx].destroy();
        this.chars.splice(idx, 1);
    }

    createTravellers(keys: CharKey[], travellersLevel: number) {
        this.encounterLevel = travellersLevel;

        const bridgePos = positioner.bridgePosition()
        const margin = 75;
        let y = bridgePos.y + bridgePos.height / 2 - ((keys.length - 1) * margin) / 2

        keys.forEach((key, i) => {
            const char = new Char(
                key,
                bridgePos.x + bridgePos.width - 50,
                y
            );
            y += margin;
            // char.goAcrossBridge();
            this.chars.push(char);
        })
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
    getFighters() { return this.chars.filter(c => c.getIsFighter())}
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
        this.getTravellers().forEach(t => t.pay());
    }

    makeAllTravellersGiveAll() {
        this.getTravellers().forEach(t => t.giveAll());
    }

    releaseChar(id: string) {
        this.chars.find(t => t.id === id)?.goAcrossBridge();
    }

    makeImprisoned(id: string) {
        this.chars.find(t => t.id === id)?.makeImprisoned();
    }

    makeCharGiveAll(id: string) {
        this.getTravellers().find(t => t.id === id)?.giveAll();
    }

    makeCharPay(id: string) {
        this.getTravellers().find(t => t.id === id)?.pay();
    }

    killChar(id: string) {
        let char = this.chars.find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.getKilled();
    }

    feedChar(id: string) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.eat();
    }

    hitChar(id: string, dmg: number) {
        let char = this.getTravellers().find(t => t.id === id);
        if (!char) throw Error('wtf');

        char.getHit(dmg);
    }

    transformToFood(id: string) {
        let char = this.chars.find(t => t.id === id)
        char?.transformToFood()
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

    findDefenders(charId: string): Char[] {
        const travellers = this.getTravellers()
        const fighters = this.getFighters()
        let char = travellers.find(t => t.id === charId);
        if (!char) throw Error('wtf');

        // @ts-ignore
        const defenders = fighters.filter(f => f.id !== charId && f.canProtect(char))

        return defenders || []
    }
}