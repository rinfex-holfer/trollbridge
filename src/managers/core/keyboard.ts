
let listenerId = 0;
let clickListenerId = 0;

export enum KeyEvent {
    KEY_UP = 'keyup',
    KEY_DOWN = 'keydown',
}

export enum KeyCode {
    ESC = 'Escape',
    W = 'KeyW',
    A = 'KeyA',
    S = 'KeyS',
    D = 'KeyD',
}

export interface Listener {
    event: KeyEvent,
    keyCode: KeyCode,
    id: number,
}
type smf = () => void;
type KeyCodeListeners = Record<number, smf>
type KeyEventListeners = Record<KeyCode, KeyCodeListeners>;
type KeyListenersMap = Record<KeyEvent, KeyEventListeners>;

class Keyboard {
    constructor() {
        // window.addEventListener('keydown', this.callKeyDownListeners);
        // window.addEventListener('keyup', this.callKeyUpListeners);
    }

    private keyListeners: KeyListenersMap = {
        [KeyEvent.KEY_UP]: {
            [KeyCode.ESC]: {},
            [KeyCode.W]: {},
            [KeyCode.A]: {},
            [KeyCode.S]: {},
            [KeyCode.D]: {},
        },
        [KeyEvent.KEY_DOWN]: {
            [KeyCode.ESC]: {},
            [KeyCode.W]: {},
            [KeyCode.A]: {},
            [KeyCode.S]: {},
            [KeyCode.D]: {},
        },
    };

    addKeyListener = (event: KeyEvent, keyCode: KeyCode, fn: () => any): Listener => {
        this.keyListeners[event][keyCode][listenerId] = fn;

        return { id: listenerId++, event, keyCode, };
    };

    removeKeyListener = (listener: Listener) => {
        delete this.keyListeners[listener.event][listener.keyCode][listener.id];
    };

    // private createKeyListenersCaller = (e: KeyEvent) => compose(
    //     forEach(call),
    //     // @ts-ignore
    //     values,
    //     propOr({}, __, this.keyListeners[e]),
    //     prop('code')
    // );

    // private callKeyDownListeners = this.createKeyListenersCaller(KeyEvent.KEY_DOWN);
    //
    // private callKeyUpListeners = this.createKeyListenersCaller(KeyEvent.KEY_UP);

    // private callClickListeners = (x, y) => values(this.clickListeners).forEach((listener: (x, y) => void) => listener(x, y));
}

export const keyManager = new Keyboard();