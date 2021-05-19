class LayerManager {
    // @ts-ignore
    scene: Phaser.Scene

    // @ts-ignore
    buttonsLayer: Phaser.GameObjects.Layer

    init(scene: Phaser.Scene) {
        this.scene = scene;

        this.buttonsLayer = this.scene.add.layer()
    }
}

export const layerManager = new LayerManager()
