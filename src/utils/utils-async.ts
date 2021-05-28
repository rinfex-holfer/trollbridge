import {stub} from "./utils-misc";

export function pause(time: number) {
    return new Promise((res) => {
        setTimeout(res, time)
    })
}

export function createPromiseAndHandlers() {
    let done: (a?: any) => void = stub
    let fail: (a?: any) => void = stub
    const promise = new Promise((res, rej) => {
        done = res
        fail = rej
    })

    return {promise, done, fail}
}