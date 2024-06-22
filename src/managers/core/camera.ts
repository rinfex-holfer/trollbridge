import {o_} from "../locator";
import GameObject = Phaser.GameObjects.GameObject;
import {O_GameObject} from "./render/types";
import {positioner} from "../game/positioner";
import {dotInRect, Vec} from "../../utils/utils-math";

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

        this.centerOnLair()
    }

    private getLairCameraPoint() {
        const {x, y, height, width} = positioner.getLairPosition()
        return {
            x: x + width / 2,
            y: y + height / 6,
        }
    }

    private getBridgeCameraPoint() {
        const pos = positioner.getBridgePosition()
        return {
            x: pos.x + pos.width / 2,
            y: pos.y + pos.height / 2
        }
    }

    centerOnLair() {
        const pos = this.getLairCameraPoint()
        this.centerOn(pos.x, pos.y)
    }

    centerOnBridge() {
        const pos = this.getBridgeCameraPoint()
        this.centerOn(pos.x, pos.y)
    }

    centerOn(x: number, y: number) {
        this.camera.centerOn(x, y);
    }

    panTo = (x: number, y: number, duration?: number, ease?: string, force?: boolean) => {
        this.camera.pan(x, y, duration, ease, force, () => {
            o_.input.cursor.updateCursorCoord()
        })
    }

    follow(gameObject: O_GameObject) {
        this.camera.startFollow(gameObject.obj)
        // this.camera.startFollow(gameObject.obj, false, 0.05, 0.05)
    }

    stopFollow() {
        this.camera.stopFollow()
    }

    zoomTo(zoom: number, duration?: number, ease?: string) {
        this.camera.zoomTo(zoom, duration, ease)
    }

    panToBridge() {
        // const x = o_.bridge.pos.x
        // const y = o_.bridge.pos.y
        // const w = o_.bridge.pos.width
        // const h = o_.bridge.pos.height
        // this.panTo(x + w / 2, y + h / 2, 2000, undefined, true)

        const pos = this.getBridgeCameraPoint()
        this.panTo(pos.x, pos.y, 2000, undefined, true)
    }

    panToLair() {
        //
        // const x = o_.lair.sprite.x
        // const y = o_.lair.sprite.y
        // const w = o_.lair.sprite.width
        // const h = o_.lair.sprite.height
        // this.panTo(x + w / 2, y + h / 2, 2000, undefined, true)

        const pos = this.getLairCameraPoint()
        this.panTo(pos.x, pos.y, 2000, undefined, true)
    }

    followTroll(val: boolean) {
        this.isFollowingTroll = val

        if (val) {
            this.follow(o_.troll.container)
            this.camera.followOffset
        } else {
            this.camera.stopFollow()
        }
    }

    checkIsInBounds(dot: Vec) {
        const bounds = this.camera.getBounds()
        return dotInRect(dot, bounds)
    }
}