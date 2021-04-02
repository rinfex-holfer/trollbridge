export const enum CharAction {
    RELEASE = 'RELEASE',
    ROB = 'ROB',
    IMPRISON = 'IMPRISON',
    KILL = 'KILL',
    EAT = 'EAT',
    MAKE_FOOD = 'MAKE_FOOD',
}

export class CharActionsMenu {
    buttons = [] as CharAction[]

    changeButtons(buttons: CharAction[]) {
        this.buttons = buttons;
    }

    show() {

    }

    hide() {

    }
}