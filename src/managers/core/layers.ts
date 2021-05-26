import {O_GameObject} from "./render/types";
import {o_} from "../locator";

export const enum LayerKey {
    BACKGROUND = 'BACKGROUND',
    PARTICLES = 'PARTICLES',
    FIELD_OBJECTS = 'FIELD_OBJECTS',
    FIELD_BUTTONS = 'FIELD_BUTTONS',
    MAIN_MENUES = 'MAIN_MENUES',
}

const layersConfig = [
    [LayerKey.BACKGROUND, 0],
    [LayerKey.FIELD_OBJECTS, 1],
    [LayerKey.FIELD_BUTTONS, 2],
    [LayerKey.PARTICLES, 3],
    [LayerKey.MAIN_MENUES, 4],
] as [LayerKey, number][]

export class LayersManager {
    private layers = {

    } as Record<LayerKey, Phaser.GameObjects.Layer>

    constructor(private scene: Phaser.Scene) {
        layersConfig.forEach(layerConfig => this.createLayer(layerConfig[0], layerConfig[1]))

        o_.register.layers(this);
        o_.time.sub(() => this.update())
    }

    private createLayer(key: LayerKey, zIndex: number) {
        this.layers[key] = this.scene.add.layer();
        this.layers[key].depth = zIndex;
    }

    addRaw(obj: Phaser.GameObjects.GameObject, layerKey: LayerKey) {
        this.layers[layerKey].add(obj)
    }

    add(obj: O_GameObject, layerKey: LayerKey) {
        this.addRaw(obj.obj, layerKey)
    }

    remove(obj: O_GameObject, layerKey: LayerKey) {
        this.layers[layerKey].remove(obj.obj)
    }

    update() {
        this.layers.FIELD_OBJECTS.getChildren().forEach(obj => {
            // @ts-ignore
            obj.depth = obj.y
        })
    }
}