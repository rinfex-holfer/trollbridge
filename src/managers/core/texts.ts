import {TextKey} from "../../translations";
import {o_} from "../locator";
import i18n from "i18next";

export class TextsManager {
    constructor() {
        o_.register.texts(this)
    }

    t(textKey: TextKey, vars?: any): string {
        return i18n.t(textKey, vars) as string
    }
}

