import {resoursePaths} from "../resourse-paths";
import {renderManager} from "./render-manager";
import {getGameSize} from "../utils/utils-misc";
import {trollManager} from "./troll-manager";

class BridgeManager {
    static CONTAINER_ID = 'bridge'

    init() {
        const container = renderManager.createContainer(BridgeManager.CONTAINER_ID)

        renderManager.createTiles({
            paths: [resoursePaths.images.floor],
            ...this.getBridgePosition(),
            container,
            entityId: 'bridge',
        })

        container.interactive = true;
        container.buttonMode = true;
        container.addListener('click', trollManager.goToBridge)
    }

    getBridgePosition() {
        const gameSize = getGameSize();
        return {
            width: gameSize.width,
            height: gameSize.height / 2,
            x: 0,
            y: 0,
        }
    }
}

export const bridgeManager = new BridgeManager();