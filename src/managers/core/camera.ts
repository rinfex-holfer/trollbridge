import {o_} from "../locator";
import GameObject = Phaser.GameObjects.GameObject;
import {O_GameObject} from "./render/types";

export class CameraManager {
    scene: Phaser.Scene
    camera: Phaser.Cameras.Scene2D.Camera

    isFollowingTroll = false

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.camera = scene.cameras.main

        // this.camera.setBounds(0, 0, 1024, 2048);
        // this.camera.setZoom(1);
        // this.camera.centerOn(0, 0);

        o_.register.camera(this)
    }

    centerOn(x: number, y: number) {
        this.camera.centerOn(x, y);
    }

    panTo = (x: number, y: number, duration?: number, ease?: string, force?: boolean) => {
        this.camera.pan(x, y, duration, ease, force)
    }

    follow(gameObject: O_GameObject) {
        this.camera.startFollow(gameObject.obj)
    }

    stopFollow() {
        this.camera.stopFollow()
    }

    zoomTo(zoom: number, duration?: number, ease?: string) {
        this.camera.zoomTo(zoom, duration, ease)
    }

    panToBridge() {
        const x = o_.bridge.pos.x
        const y = o_.bridge.pos.y
        const w = o_.bridge.pos.width
        const h = o_.bridge.pos.height

        this.panTo(x + w / 2, y + h / 2, 2000, undefined, true)
    }

    panToLair() {
        const x = o_.lair.sprite.x
        const y = o_.lair.sprite.y
        const w = o_.lair.sprite.width
        const h = o_.lair.sprite.height

        this.panTo(x + w / 2, y + h / 2, 2000, undefined, true)
    }

    followTroll(val: boolean) {
        this.isFollowingTroll = val

        if (val) {
            this.follow(o_.troll.container)
        } else {
            this.camera.stopFollow()
        }
    }
}