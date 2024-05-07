import {stub} from "./utils-misc";

export function pause(time: number) {
    return new Promise((res) => {
        setTimeout(res, time)
    })
}

export function createPromiseAndHandlers<T = void>() {
    let done: (a: T) => void = stub
    let fail: (a?: any) => void = stub
    const promise = new Promise<T>((res, rej) => {
        done = res
        fail = rej
    })

    return {promise, done, fail}
}

export const CANCELLED = "CANCELLED"

export function createCancellablePromise<T = void>() {
    const {promise, done, fail} = createPromiseAndHandlers<T | typeof CANCELLED>()

    const cancel = () => {
        done(CANCELLED);
    };

    return {promise, cancel, done, fail};
}

export type CancellablePromise<T = void> = Promise<T | typeof CANCELLED>
