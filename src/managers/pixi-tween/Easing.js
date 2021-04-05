/* eslint-disable no-mixed-operators */

/**
 * @namespace PIXI.tween.Easing
 */
const Easing = {
    /**
     * linear tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of linear easing function
     */
    linear() {
        return function linear(t) {
            return t;
        };
    },

    /**
     * inQuad tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inQuad easing function
     */
    inQuad() {
        return function inQuad(t) {
            return t * t;
        };
    },

    /**
     * outQuad tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outQuad easing function
     */
    outQuad() {
        return function outQuad(t) {
            return t * (2 - t);
        };
    },

    /**
     * inOutQuad tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutQuad easing function
     */
    inOutQuad() {
        return function inOutQuad(t) {
            t *= 2;
            if (t < 1) return 0.5 * t * t;

            return -0.5 * (--t * (t - 2) - 1);
        };
    },

    /**
     * inCubic tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inCubic easing function
     */
    inCubic() {
        return function inCubic(t) {
            return t * t * t;
        };
    },

    /**
     * outCubic tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outCubic easing function
     */
    outCubic() {
        return function outCubic(t) {
            return --t * t * t + 1;
        };
    },

    /**
     * inOutCubic tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutCubic easing function
     */
    inOutCubic() {
        return function inOutCubic(t) {
            t *= 2;
            if (t < 1) return 0.5 * t * t * t;
            t -= 2;

            return 0.5 * (t * t * t + 2);
        };
    },

    /**
     * inQuart tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inQuart easing function
     */
    inQuart() {
        return function inQuart(t) {
            return t * t * t * t;
        };
    },

    /**
     * outQuart tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outQuart easing function
     */
    outQuart() {
        return function outQuart(t) {
            return 1 - (--t * t * t * t);
        };
    },

    /**
     * inOutQuart tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutQuart easing function
     */
    inOutQuart() {
        return function inOutQuart(t) {
            t *= 2;
            if (t < 1) return 0.5 * t * t * t * t;
            t -= 2;

            return -0.5 * (t * t * t * t - 2);
        };
    },

    /**
     * inQuint tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inQuint easing function
     */
    inQuint() {
        return function inQuint(t) {
            return t * t * t * t * t;
        };
    },

    /**
     * outQuint tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outQuint easing function
     */
    outQuint() {
        return function outQuint(t) {
            return --t * t * t * t * t + 1;
        };
    },

    /**
     * inOutQuint tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutQuint easing function
     */
    inOutQuint() {
        return function inOutQuint(t) {
            t *= 2;
            if (t < 1) return 0.5 * t * t * t * t * t;
            t -= 2;

            return 0.5 * (t * t * t * t * t + 2);
        };
    },

    /**
     * inSine tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inSine easing function
     */
    inSine() {
        return function inSine(t) {
            return 1 - Math.cos(t * Math.PI / 2);
        };
    },

    /**
     * outSine tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outSine easing function
     */
    outSine() {
        return function outSine(t) {
            return Math.sin(t * Math.PI / 2);
        };
    },

    /**
     * inOutSine tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutSine easing function
     */
    inOutSine() {
        return function inOutSine(t) {
            return 0.5 * (1 - Math.cos(Math.PI * t));
        };
    },

    /**
     * inExpo tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inExpo easing function
     */
    inExpo() {
        return function inExpo(t) {
            return t === 0 ? 0 : Math.pow(1024, t - 1);
        };
    },

    /**
     * outExpo tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outExpo easing function
     */
    outExpo() {
        return function outExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };
    },

    /**
     * inOutExpo tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutExpo easing function
     */
    inOutExpo() {
        return function inOutExpo(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            t *= 2;
            if (t < 1) return 0.5 * Math.pow(1024, t - 1);

            return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
        };
    },

    /**
     * inCirc tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inCirc easing function
     */
    inCirc() {
        return function inCirc(t) {
            return 1 - Math.sqrt(1 - t * t);
        };
    },

    /**
     * outCirc tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outCirc easing function
     */
    outCirc() {
        return function outCirc(t) {
            return Math.sqrt(1 - (--t * t));
        };
    },

    /**
     * inOutCirc tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutCirc easing function
     */
    inOutCirc() {
        return function inOutCirc(t) {
            t *= 2;
            if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);

            return 0.5 * (Math.sqrt(1 - (t - 2) * (t - 2)) + 1);
        };
    },

    /**
     * inElastic tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [a=0.1] - a
     * @param {number} [p=0.4] - p
     * @returns {function} - New instance of inElastic easing function
     */
    inElastic(a = 0.1, p = 0.4) {
        return function inElastic(t) {
            let s;

            if (t === 0) return 0;
            if (t === 1) return 1;
            if (!a || a < 1) {
                a = 1; s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }

            return -(a * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1) - s) * (2 * Math.PI) / p));
        };
    },

    /**
     * outElastic tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [a=0.1] - a
     * @param {number} [p=0.4] - p
     * @returns {function} - New instance of outElastic easing function
     */
    outElastic(a = 0.1, p = 0.4) {
        return function outElastic(t) {
            let s;

            if (t === 0) return 0;
            if (t === 1) return 1;
            if (!a || a < 1) {
                a = 1; s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }

            return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1);
        };
    },

    /**
     * inOutElastic tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [a=0.1] - a
     * @param {number} [p=0.4] - p
     * @returns {function} - New instance of inOutElastic easing function
     */
    inOutElastic(a = 0.1, p = 0.4) {
        return function inOutElastic(t) {
            let s;

            if (t === 0) return 0;
            if (t === 1) return 1;
            if (!a || a < 1) {
                a = 1; s = p / 4;
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            t *= 2;
            if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1) - s) * (2 * Math.PI) / p));

            return a * Math.pow(2, -10 * (t - 1)) * Math.sin(((t - 1) - s) * (2 * Math.PI) / p) * 0.5 + 1;
        };
    },

    /**
     * inBack tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [v=1.70158] - v
     * @returns {function} - New instance of inBack easing function
     */
    inBack(v = 1.70158) {
        return function inBack(t) {
            const s = v;

            return t * t * ((s + 1) * t - s);
        };
    },

    /**
     * outBack tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [v=1.70158] - v
     * @returns {function} - New instance of outBack easing function
     */
    outBack(v = 1.70158) {
        return function outBack(t) {
            const s = v;

            return --t * t * ((s + 1) * t + s) + 1;
        };
    },

    /**
     * inOutBack tween
     *
     * @memberof PIXI.tween.Easing
     * @param {number} [v=1.70158] - v
     * @returns {function} - New instance of inOutBack easing function
     */
    inOutBack(v = 1.70158) {
        return function inOutBack(t) {
            const s = v * 1.525;

            t *= 2;
            if (t < 1) return 0.5 * (t * t * ((s + 1) * t - s));

            return 0.5 * ((t - 2) * (t - 2) * ((s + 1) * (t - 2) + s) + 2);
        };
    },

    /**
     * inBounce tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inBounce easing function
     */
    inBounce() {
        return function inBounce(t) {
            return 1 - Easing.outBounce()(1 - t);
        };
    },

    /**
     * outBounce tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of outBounce easing function
     */
    outBounce() {
        return function outBounce(t) {
            if (t < (1 / 2.75)) {
                return 7.5625 * t * t;
            } else if (t < (2 / 2.75)) {
                t = (t - (1.5 / 2.75));

                return 7.5625 * t * t + 0.75;
            } else if (t < (2.5 / 2.75)) {
                t = (t - (2.25 / 2.75));

                return 7.5625 * t * t + 0.9375;
            }
            t -= (2.625 / 2.75);

            return 7.5625 * t * t + 0.984375;
        };
    },

    /**
     * inOutBounce tween
     *
     * @memberof PIXI.tween.Easing
     * @returns {function} - New instance of inOutBounce easing function
     */
    inOutBounce() {
        return function inOutBounce(t) {
            if (t < 0.5) return Easing.inBounce()(t * 2) * 0.5;

            return Easing.outBounce()(t * 2 - 1) * 0.5 + 0.5;
        };
    },
};

export default Easing;
