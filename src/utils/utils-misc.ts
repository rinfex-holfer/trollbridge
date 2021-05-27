let GAME_WIDTH = 0;
let GAME_HEIGHT = 0;
export const getGameSize = () => {
    if (!GAME_WIDTH) {
        GAME_WIDTH = window.innerWidth * window.devicePixelRatio;
    }

    if (!GAME_HEIGHT) {
        GAME_HEIGHT = window.innerHeight * window.devicePixelRatio;
    }

    return {height: GAME_HEIGHT, width: GAME_WIDTH};
};

const ids = {} as {[entityType: string]: number};
export function createId(key: string): string {
    if (ids[key] === undefined) ids[key] = -1;

    ids[key] = ids[key] + 1;
    return key + '_' + ids[key];
}

export const dumbClone = (obj: any) => JSON.parse(JSON.stringify(obj));

export const stub = () => void 0;

export function findAndSplice<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item)

    if (index === -1) return false

    arr.splice(index, 1)
    return true
}

export function createMessageEmitter<Message>() {
    type Handler = (message: Message) => void
    const subscribers = [] as [number, Handler][];
    let nextId = 0;

    return {
        sub: (handler: Handler) => {
            const id = nextId;
            subscribers.push([id, handler])
            nextId++
            return id;
        },
        unsub: (id: number) => {
            const idx = subscribers.findIndex(([subId, _]) => subId === id)
            if (idx > -1) subscribers.splice(idx, 1)
            else console.warn('no subscriber with id', id)
        },
        emit: (message: Message) => {
            subscribers.forEach(s => s[1](message))
        }
    }
}