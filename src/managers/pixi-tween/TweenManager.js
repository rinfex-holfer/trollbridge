import Tween from './Tween';

/**
 * Tween manager class, that handles updating child Tweens
 *
 * @class
 * @memberof PIXI.tween
 */
export default class TweenManager {
    /** */
    constructor() {
        /** @member {Array.<PIXI.tween.Tween>} - The array of tweens being manager */
        this.tweens = [];

        this._tweensToDelete = [];
        this._last = 0;
    }

    /**
     * Updating of the tween manager, which will in turn update any active tweens
     *
     * @param {number} [deltaMS] - If not provided, an internal deltaMS will be calculated
     */
    update(deltaMS) {
        if (!deltaMS && deltaMS !== 0) {
            deltaMS = this._getDeltaMS();
        }

        for (let i = 0; i < this.tweens.length; ++i) {
            const tween = this.tweens[i];

            if (tween.active) {
                tween.update(deltaMS);
            }

            if (tween.isEnded && tween.expire) {
                tween.remove();
            }
        }

        if (this._tweensToDelete.length) {
            for (let i = 0; i < this._tweensToDelete.length; ++i) {
                this._remove(this._tweensToDelete[i]);
            }
            this._tweensToDelete.length = 0;
        }
    }

    /**
     * Returns an array with all the tweens for the given target.
     *
     * @param {any} target - The target object to check for tweens
     * @returns {Array.<PIXI.tween.Tween>} - Tweens attached to the given target
     */
    getTweensForTarget(target) {
        const tweens = [];

        for (let i = 0; i < this.tweens.length; ++i) {
            if (this.tweens[i].target === target) {
                tweens.push(this.tweens[i]);
            }
        }

        return tweens;
    }

    /**
     * Returns a new tween instance that is managed by this tween manager.
     *
     * @param {any} target - The target object to add a tween to
     * @param {PIXI.tween.Tween#tweenConfig} [config] - object to configure the tween
     * @returns {PIXI.tween.Tween} - New tween instance
     */
    createTween(target, config) {
        return new Tween(target, this, config);
    }

    /**
     * Normally you want to use .createTween(target) to create a tween, but, you can also create a tween
     * with new PIXI.Tween(target) and add it in the manager with this method.
     *
     * @param {PIXI.tween.Tween} tween - Tween to add
     */
    addTween(tween) {
        if (tween) {
            tween.manager = this;
            this.tweens.push(tween);
        }
    }

    /**
     * Removes a tween from being managed by this instance
     *
     * @param {PIXI.tween.Tween} tween - Tween to remove
     */
    removeTween(tween) {
        if (tween) {
            this._tweensToDelete.push(tween);
        }
    }

    /**
     * Delets the tween from the array of managed tweens
     *
     * @param {PIXI.tween.Tween} tween - Tween to remove
     * @private
     */
    _remove(tween) {
        const index = this.tweens.indexOf(tween);

        if (index !== -1) {
            this.tweens.splice(index, 1);
        }
    }

    /**
     * Returns a new tween instance that is managed by this tween manager.
     *
     * @returns {number} - How much time in ms has passed since update was last called
     * @private
     */
    _getDeltaMS() {
        if (this._last === 0) {
            this._last = Date.now();
        }
        const now = Date.now();
        const deltaMS = now - this._last;

        this._last = now;

        return deltaMS;
    }
}
