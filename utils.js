export function getRndSign() {
    return Math.random() > 0.5 ? 1 : -1;
}

export function rnd() {
    return Math.random();
}

export function getRndItem(arr) {
    const rndIndex = rndBetween(0, arr.length - 1);
    return arr[rndIndex];
}

export function rndBetween(a, b) {
    return a + Math.floor(rnd() * (b - a + 1));
}