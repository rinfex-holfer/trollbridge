import {encounters, encounterDanger} from "./encounters.js";
import {getRndItem, rndBetween} from "./utils.js";
import {createEnemy, EnemyKey} from "./enemies.js";

const Time = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    NIGHT: 'night',
};

const TimeOrder = [Time.MORNING, Time.AFTERNOON, Time.EVENING, Time.NIGHT];

const constants = {
    MAX_HUNGER: 10,
    HUNGER_PER_TIME: 1,
    HP_MINUS_WHEN_HUNGRY: 1,
    MAX_HP: {
        1: 10,
        2: 13,
        3: 16,
        4: 20,
        5: 25,
    },
}

const game = new Vue({
    el: '#app',
    data: {
        day: 1,
        time: Time.MORNING,

        troll: {
            level: 1,
            hp: constants.MAX_HP[1],
            hunger: 0,
            alive: true,
            gameoverCause: null,
        },

        lair: {

        },

        resourses: {
            food: 0,
            gold: 0,
            materials: 0,
        },

        passingBy: null
    },
    methods: {
        nextTime: function() {
            const timeIndex = TimeOrder.indexOf(this.time);
            if (timeIndex === TimeOrder.length - 1) {
                this.day = this.day + 1;
                this.time = TimeOrder[0];
            } else {
                this.time = TimeOrder[timeIndex + 1];
            }

            this.getRandomEvent();

            this.increaseHunger(constants.HUNGER_PER_TIME)
        },

        increaseHunger(val) {
            const newHunger = this.troll.hunger + val;
            if (newHunger > constants.MAX_HUNGER) {
                this.changeTrollHp(-constants.HP_MINUS_WHEN_HUNGRY, 'hunger')
            }

            this.troll.hunger = Math.min(newHunger, constants.MAX_HUNGER);
        },

        changeTrollHp(val, cause = 'hunger') {
            const newVal = this.troll.hp + val;
            this.troll.hp = Math.max(Math.min(newVal, constants.MAX_HP[this.troll.level]), 0);
            if (this.troll.hp === 0 && this.troll.alive) {
                this.troll.alive = false;
                this.troll.gameoverCause = cause;
            }
        },

        getRandomEvent() {
            this.passingBy = getRandomEnemies();
        },

        rob() {
            const dangerCode = this.dangerCode;
            let damage = 0;
            switch (dangerCode) {
                case "NONE":
                    break;
                case "LOW":
                    damage = rndBetween(0, 2);
                    break;
                case "MEDIUM":
                    damage = rndBetween(2, constants.MAX_HP[this.troll.level] * 0.33)
                    break;
                case "HIGH":
                    damage = rndBetween(2, constants.MAX_HP[this.troll.level] * 0.66)
                    break;
                case "VERY_HIGH":
                    damage = rndBetween(2, constants.MAX_HP[this.troll.level] * 0.99)
                    break;
                case "IMPOSSIBLE":
                    damage = constants.MAX_HP[this.troll.level];
                    break;
            }

            if (damage > 0) this.changeTrollHp(damage, 'battle');

            if (!this.troll.alive) return;
        },

        enemyPays(enemy, resourse) {
            this.resourses[resourse] += Math.ceil(enemy.resourses[resourse] * 0.33);
        },

        enemyGivesAll(enemy) {
            this.resourses.gold += enemy.resourses.gold;
            this.resourses.materials += enemy.resourses.materials;
            this.resourses.food += enemy.resourses.food;
        },

        allGivesAll(enemies) {
            enemies.forEach(enemy => this.enemyGivesAll(enemy));
        },

        allPays(enemies) {
            enemies.forEach(enemy => this.enemyPays(enemy, 'gold'));
        }
    },

    computed: {
        dangerLevel: function() {
            return this.troll.level - this.passingBy.level;
        },
        dangerCode: function () {
            if (this.passingBy.level === 0) return encounterDanger.NONE

            const diff = this.dangerLevel();
            if (diff > 1) return encounterDanger.LOW;
            else if (diff === 1) return encounterDanger.LOW;
            else if (diff === 0) return encounterDanger.MEDIUM;
            else if (diff === -1) return encounterDanger.HIGH;
            else if (diff === -2) return encounterDanger.VERY_HIGH;
            else return encounterDanger.IMPOSSIBLE;
        }
    }
})

const getRandomEnemies = () => {
    const rnd = rndBetween(Math.max(0, game.troll.level - 1), game.troll.level + 1);
    const encounter = getRndItem(encounters[rnd]);
    const item = {
        level: encounter.level,
        enemies: encounter.enemies.map(key => createEnemy[key]()),
        stuff: encounter.stuff.map(key => createEnemy[key]()),
        nonCombatants: encounter.nonCombatants.map(key => createEnemy[key]()),
    };
    return item;
}

