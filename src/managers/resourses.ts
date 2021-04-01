import {gameState} from "../game-state";
import {Enemy, ResourceKey} from "../types";
import {eventBus, Evt} from "../event-bus";

eventBus.on(Evt.PAYMENT_GIVEN, () => resourseManager.allPays())
eventBus.on(Evt.ALL_GIVEN, () => resourseManager.allGivesAll())

export const resourseManager = {
    enemyPays(enemy: Enemy, resourse: ResourceKey) {
        const howMuch = Math.ceil(enemy.resourses[resourse] * 0.33);
        gameState[resourse] += howMuch;
        enemy.resourses[resourse] -= howMuch;

        eventBus.emit(Evt.RESOURSES_CHANGED);
    },

    enemyGivesAll(enemy: Enemy) {
        gameState.gold += enemy.resourses.gold;
        gameState.materials += enemy.resourses.materials;
        gameState.food += enemy.resourses.food;

        enemy.resourses.gold = 0;
        enemy.resourses.materials = 0;
        enemy.resourses.food = 0;

        eventBus.emit(Evt.RESOURSES_CHANGED);
    },

    allGivesAll() {
        console.log('allGivesAll');
        if (!gameState.passingBy) throw Error('no passingBy!');

        gameState.passingBy.enemies.forEach(enemy => resourseManager.enemyGivesAll(enemy));
        gameState.passingBy.stuff.forEach(enemy => resourseManager.enemyGivesAll(enemy));
        gameState.passingBy.nonCombatants.forEach(enemy => resourseManager.enemyGivesAll(enemy));

        eventBus.emit(Evt.RESOURSES_CHANGED);
    },

    allPays() {
        console.log('allPays');
        if (!gameState.passingBy) throw Error('no passingBy!');

        gameState.passingBy.enemies.forEach(enemy => resourseManager.enemyPays(enemy, ResourceKey.GOLD));
        gameState.passingBy.stuff.forEach(enemy => resourseManager.enemyPays(enemy, ResourceKey.GOLD));
        gameState.passingBy.nonCombatants.forEach(enemy => resourseManager.enemyPays(enemy, ResourceKey.GOLD));

        eventBus.emit(Evt.RESOURSES_CHANGED);
    }

}

