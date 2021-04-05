/**
 * Class that allows drawing a path using PIXI.Graphics, which can then be followed and used as a tween
 *
 * @class
 * @memberof PIXI.tween
 */
export default class TweenPath {
    /** */
    constructor() {
        /** @member {PIXI.Polygon} - PIXI object to use as the path */
        this.polygon = new PIXI.Polygon();
        this.polygon.closed = false;

        /** @member {PIXI.GraphicsData} - Current path */
        this.currentPath = null;

        /** @member {Array.<PIXI.GraphicsData>} - Graphics data */
        this.graphicsData = [];

        /**
         * @member {boolean}
         * Used to detect if the graphics object has changed.
         * If this is set to true then the graphics object will be recalculated.
         */
        this.dirty = true;

        this._closed = false;
        this._tmpPoint = new PIXI.Point();
        this._tmpPoint2 = new PIXI.Point();
        this._tmpDistance = [];
    }

    /**
     * Set true to close your path
     *
     * @member {boolean}
     */
    get closed() {
        return this._closed;
    }

    set closed(value) { // eslint-disable-line require-jsdoc
        if (this._closed === value) {
            return;
        }
        this.polygon.closed = value;
        this._closed = value;
        this.dirty = true;
    }

    /**
     * The number of points along the path
     *
     * @member {number}
     * @readonly
     */
    get length() {
        return (this.polygon.points.length) ? (this.polygon.points.length / 2) + ((this._closed) ? 1 : 0) : 0;
    }

    /**
     * Clear the path
     * Moves the current drawing position to x, y.
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#moveTo
     *
     * @param {number} x - the X coordinate to move to
     * @param {number} y - the Y coordinate to move to
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    moveTo(x, y) {
        PIXI.Graphics.prototype.moveTo.call(this, x, y);
        this.dirty = true;

        return this;
    }

    /**
     * Draws a line using the current line style from the current drawing position to (x, y);
     * The current drawing position is then set to (x, y).
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#lineTo
     *
     * @param {number} x - the X coordinate to draw to
     * @param {number} y - the Y coordinate to draw to     *
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    lineTo(x, y) {
        PIXI.Graphics.prototype.lineTo.call(this, x, y);
        this.dirty = true;

        return this;
    }

    /**
     * Calculate the points for a quadratic bezier curve and then draws it.
     * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#quadraticCurveTo
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    quadraticCurveTo(cpX, cpY, toX, toY) {
        PIXI.Graphics.prototype.quadraticCurveTo.call(this, cpX, cpY, toX, toY);
        this.dirty = true;

        return this;
    }

    /**
     * Calculate the points for a bezier curve and then draws it.
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#bezierCurveTo
     *
     * @param {number} cpX - Control point x
     * @param {number} cpY - Control point y
     * @param {number} cpX2 - Second Control point x
     * @param {number} cpY2 - Second Control point y
     * @param {number} toX - Destination point x
     * @param {number} toY - Destination point y     *
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        PIXI.Graphics.prototype.bezierCurveTo.call(this, cpX, cpY, cpX2, cpY2, toX, toY);
        this.dirty = true;

        return this;
    }

    /**
     * The arcTo() method creates an arc/curve between two tangents on the canvas.
     * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#arcTo
     *
     * @param {number} x1 - The x-coordinate of the beginning of the arc
     * @param {number} y1 - The y-coordinate of the beginning of the arc
     * @param {number} x2 - The x-coordinate of the end of the arc
     * @param {number} y2 - The y-coordinate of the end of the arc
     * @param {number} radius - The radius of the arc
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    arcTo(x1, y1, x2, y2, radius) {
        PIXI.Graphics.prototype.arcTo.call(this, x1, y1, x2, y2, radius);
        this.dirty = true;

        return this;
    }

    /**
     * The arc method creates an arc/curve (used to create circles, or parts of circles).
     * @see https://pixijs.github.io/docs/PIXI.Graphics.html#arc
     *
     * @param {number} cx - The x-coordinate of the center of the circle
     * @param {number} cy - The y-coordinate of the center of the circle
     * @param {number} radius - The radius of the circle
     * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
     *  of the arc's circle)
     * @param {number} endAngle - The ending angle, in radians
     * @param {boolean} [anticlockwise=false] - Specifies whether the drawing should be
     *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
     *  indicates counter-clockwise.
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    arc(cx, cy, radius, startAngle, endAngle, anticlockwise) {
        PIXI.Graphics.prototype.arc.call(this, cx, cy, radius, startAngle, endAngle, anticlockwise);
        this.dirty = true;

        return this;
    }

    /**
     * Draws the given shape to this TweenPath object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    drawShape(shape) {
        PIXI.Graphics.prototype.drawShape.call(this, shape);
        this.dirty = true;

        return this;
    }

    /**
     * Clear the path
     *
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    clear() {
        this.graphicsData.length = 0;
        this.currentPath = null;
        this.polygon.points.length = 0;
        this._closed = false;
        this.dirty = false;

        return this;
    }

    /**
     * Parse the list of points from the path
     *
     * @returns {PIXI.tween.TweenPath} - This instance of TweenPath
     */
    parsePoints() {
        if (!this.dirty) {
            return this;
        }
        this.dirty = false;
        this.polygon.points.length = 0;
        for (let i = 0; i < this.graphicsData.length; ++i) {
            const shape = this.graphicsData[i].shape;

            if (shape && shape.points) {
                this.polygon.points = this.polygon.points.concat(shape.points);
            }
        }

        return this;
    }

    /**
     * Finds the nth point along the path
     *
     * @param {PIXI.Point} num - Point
     * @returns {PIXI.Point} - Point co-ordinates
     */
    getPoint(num) {
        this.parsePoints();
        const len = (this.closed && num >= this.length - 1) ? 0 : num * 2;

        this._tmpPoint.set(this.polygon.points[len], this.polygon.points[len + 1]);

        return this._tmpPoint;
    }

    /**
     * Finds the nth point along the path
     *
     * @param {PIXI.Point} num - Point
     * @returns {PIXI.Point} - Point co-ordinates
     */
    getPointAt(num) {
        this.parsePoints();
        if (num > this.length) {
            return this.getPoint(this.length - 1);
        }

        if (num % 1 === 0) {
            return this.getPoint(num);
        }
        this._tmpPoint2.set(0, 0);
        const diff = num % 1;
        const { x: ceilX, y: ceilY } = this.getPoint(Math.ceil(num));
        const { x: floorX, y: floorY } = this.getPoint(Math.floor(num));

        const xx = -((floorX - ceilX) * diff);
        const yy = -((floorY - ceilY) * diff);

        this._tmpPoint2.set(floorX + xx, floorY + yy);

        return this._tmpPoint2;
    }

    /**
     * Finds the distance between two points
     *
     * @param {PIXI.Point} num1 - First point
     * @param {PIXI.Point} num2 - Second point
     * @returns {number} - Distance in pixels
     */
    distanceBetween(num1, num2) {
        this.parsePoints();
        const { x: p1X, y: p1Y } = this.getPoint(num1);
        const { x: p2X, y: p2Y } = this.getPoint(num2);
        const dx = p2X - p1X;
        const dy = p2Y - p1Y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }

    /**
     * Calculates the total distance along the entire path
     *
     * @returns {number} - Distance in pixels
     */
    totalDistance() {
        this.parsePoints();
        this._tmpDistance.length = 0;
        this._tmpDistance.push(0);

        const len = this.length;
        let distance = 0;

        for (let i = 0; i < len - 1; ++i) {
            distance += this.distanceBetween(i, i + 1);
            this._tmpDistance.push(distance);
        }

        return distance;
    }

    /**
     * Finds the nearest point for the distance to be travelled
     *
     * @param {number} distance - how far to travel
     * @returns {PIXI.Point} - Point co-ordinates
     */
    getPointAtDistance(distance) {
        this.parsePoints();
        if (!this._tmpDistance) {
            this.totalDistance();
        }
        const len = this._tmpDistance.length;
        let n = 0;

        const totalDistance = this._tmpDistance[this._tmpDistance.length - 1];

        if (distance < 0) {
            distance = totalDistance + distance;
        } else if (distance > totalDistance) {
            distance = distance - totalDistance;
        }

        for (let i = 0; i < len; ++i) {
            if (distance >= this._tmpDistance[i]) {
                n = i;
            }

            if (distance < this._tmpDistance[i]) break;
        }

        if (n === this.length - 1) {
            return this.getPointAt(n);
        }

        const diff1 = distance - this._tmpDistance[n];
        const diff2 = this._tmpDistance[n + 1] - this._tmpDistance[n];

        return this.getPointAt(n + (diff1 / diff2));
    }
}
