import {stub} from "./utils-misc";

export function pause(time: number) {
    return new Promise((res) => {
        setTimeout(res, time)
    })
}

export function createPromiseAndHandlers<T>() {
    let done: (a: T) => void = stub
    let fail: (a?: any) => void = stub
    const promise = new Promise<T>((res, rej) => {
        done = res
        fail = rej
    })

    return {promise, done, fail}
}

export function createCancellablePromise<T>() {
    const {} = createPromiseAndHandlers<T>()
}

