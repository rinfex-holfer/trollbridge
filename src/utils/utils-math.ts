export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Vec {
    x: number,
    y: number
}

export interface Cell {
    col: number,
    row: number
}

export function rotate(point: Vec, angle: number, origin = {x: 0, y: 0}) {
    return {
        x: (point.x - origin.x) * Math.cos(angle) - (point.y - origin.y) * Math.sin(angle) + origin.x,
        y: (point.x - origin.x) * Math.sin(angle) + (point.y - origin.y) * Math.cos(angle) + origin.y
    };
}

export function boxesIntersect(a: Rect, b: Rect) {
    return a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height > b.y && a.y < b.y + b.height;
}

export function dotInRect(dot: Vec, rect: Rect): Boolean {
    return dot.y >= rect.y &&
        dot.y <= rect.y + rect.height &&
        dot.x >= rect.x &&
        dot.x <= rect.x + rect.width;
}

export function getRndSign() {
    return Math.random() > 0.5 ? 1 : -1;
}

export function rnd() {
    return Math.random();
}

export function getRndItem<T>(arr: T[]): T {
    const rndIndex = rndBetween(0, arr.length - 1);
    return arr[rndIndex];
}

export function rndBetween(a: number, b: number) {
    return a + Math.floor(rnd() * (b - a + 1));
}

export function getVector(point1: Vec, point2: Vec): Vec {
    return {
        x: point2.x - point1.x,
        y: point2.y - point1.y
    };
}

export function getDistanceBetween(point1: Vec, point2: Vec): number {
    return getVectorLength(getVector(point1, point2));
}

export function getVectorLength(vector: Vec): number {
    return (Math.sqrt(vector.x * vector.x + vector.y * vector.y));
}

export function getNormalizedVector(vector: Vec) {
    const vector_length = getVectorLength(vector);
    return {
        x: vector.x / vector_length,
        y: vector.y / vector_length
    };
}

export const roundTo = (a: number, charsAfterPoint: number) => {
    return Math.round(a * 10 * charsAfterPoint) / (10 * charsAfterPoint);
}

export const floorTo = (a: number, charsAfterPoint: number) => {
    return Math.floor(a * 10 * charsAfterPoint) / (10 * charsAfterPoint);
}

export const ceilTo = (a: number, charsAfterPoint: number) => {
    return Math.ceil(a * 10 * charsAfterPoint) / (10 * charsAfterPoint);
}

export const sortByDistance = <T extends Vec, T2  extends Vec>(arr: T[], item: T2): T[] => arr.sort(
    (a1, a2) => getDistanceBetween(a1, item) < getDistanceBetween(a2, item) ? -1 : 1
)


export const getMax = (arr: number[]): number[] => {
    return arr.reduce((acc, next) => {
        if (acc[0] === undefined || next > acc[0]) {
            return [next];
        } else if (next === acc[0]) {
            acc.push(next);
            return acc;
        } else {
            return acc;
        }
    }, arr)
}

export const getMaxBy = <T>(arr: T[], key: keyof T): T[] => {
    return arr.reduce((acc, next) => {
        if (acc[0] === undefined || next[key] > acc[0][key]) {
            return [next];
        } else if (next[key] === acc[0][key]) {
            acc.push(next);
            return acc;
        } else {
            return acc;
        }
    }, arr)
}