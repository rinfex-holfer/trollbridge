import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {resoursePaths} from "../../../resourse-paths";
import Phaser from "phaser";
import {O_GameObject} from "./types";
import {O_Container} from "./container";
import {O_Sprite} from "./sprite";
import {O_AnimatedSprite} from "./animated-sprite";
import {O_Tiles} from "./o_Tiles";
import {O_Text} from "./text";
import {o_} from "../../locator";
import {LayerKey} from "../layers";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import GameObject = Phaser.GameObjects.GameObject;
import {stub} from "../../../utils/utils-misc";

export class RenderManager {
    scene: Phaser.Scene

    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter
    yellowEmitter: Phaser.GameObjects.Particles.ParticleEmitter
    greenSmokeParticles: Phaser.GameObjects.Particles.ParticleEmitterManager

    constructor(scene: Phaser.Scene) {
        this.scene = scene

        o_.register.render(this);

        const bloodParticles = this.scene.add.particles('particle_blood');
        this.bloodEmitter = bloodParticles.createEmitter({
            x: {min: -5, max: 5},
            y: {min: -5, max: 5},
            angle: { min: 0, max: 360 },
            speed: {min: 100, max: 300},
            lifespan: 300,
            frequency: -1,
            quantity: 50,
        });
        o_.layers.addRaw(bloodParticles, LayerKey.PARTICLES)

        const yellowParticles = this.scene.add.particles('particle_hit');
        this.yellowEmitter = yellowParticles.createEmitter({
            x: {min: -15, max: 15},
            y: {min: -15, max: 15},
            angle: { min: 250, max: 290 },
            speed: {min: 600, max: 800},
            gravityY: 2400,
            frequency: -1,
            quantity: 50,
            lifespan: 500,
        })
        o_.layers.addRaw(yellowParticles, LayerKey.PARTICLES)

        this.greenSmokeParticles = this.scene.add.particles('particle_smoke_green');
        o_.layers.addRaw(this.greenSmokeParticles, LayerKey.PARTICLES)
    }

    createGreenSmokeEmitter() {
        return this.greenSmokeParticles.createEmitter({
            scale: {min: 1, max: 5},
            angle: 270,
            speed: {min: 10, max: 50},
            frequency: 300,
            quantity: 5,
            lifespan: 500,
            active: false
        })
    }

    burstBlood(x: number, y: number) {
        this.bloodEmitter.explode(50, x, y);
    }

    burstYellow(x: number, y: number) {
        this.yellowEmitter.explode(50, x, y);
    }

    moveTowards(obj: O_GameObject, x: number, y: number, speed: number, maxTime?: number) {
        this.scene.physics.moveTo(obj.obj, x, y, speed, maxTime)
    }

    moveTo(obj: O_GameObject, pos: Vec, speed: number) {
        this.scene.physics.moveTo(obj.obj, pos.x, pos.y, speed)

        const p = createPromiseAndHandlers()
        const unsubId = o_.time.sub(dt => {
            const step = (speed / 1000) * dt
            console.log(getDistanceBetween(obj, pos))
            if (getDistanceBetween(obj, pos) > step) return

            obj.x = pos.x
            obj.y = pos.y
            obj.stop()

            o_.time.unsub(unsubId)

            p.done()
        })

        p.promise.catch(() => {
            o_.time.unsub(unsubId)
        })

        return {promise: p.promise, stop: p.fail}
    }

    directToTarget(obj: O_GameObject, target: Vec, offset?: number) {
        obj.obj.scaleX = Math.sign(target.x - (obj.obj.x + (offset || 0))) || 1
    }

    createContainer(x: number, y: number, options?: {parent?: O_Container}) {
        return new O_Container(this.scene, x, y, options)
    }

    createSprite(key: keyof typeof resoursePaths.images, x: number, y: number, options?: {width?: number, height?: number, parent?: O_Container}) {
        return new O_Sprite(this.scene, key, x, y, options)
    }

    createAnimatedSprite(
        options: {
            atlasKey: keyof typeof resoursePaths.atlases,
            animations: { framesPrefix: string, frameRate?: number, repeat?: number }[],
            x: number,
            y: number,
            parent?: O_Container
        }
    ) {
        return new O_AnimatedSprite(this.scene, options)
    }

    createTiles(key: keyof typeof resoursePaths.images, x: number, y: number, width: number, height: number) {
        return new O_Tiles(this.scene, key, x, y, width, height);
    }

    createText(text: string, x: number, y: number, style: Phaser.Types.GameObjects.Text.TextStyle, options?: {parent?: O_Container}) {
        return new O_Text(this.scene, text, x, y, style, options);
    }

    createTimeline(config?: Phaser.Types.Tweens.TimelineBuilderConfig) {
        return this.scene.tweens.createTimeline(config)
    }

    flyTo(obj: O_GameObject, pos: Vec, speed: number, maxDuration?: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline();
        const distance = getDistanceBetween(obj, pos);
        let duration = distance / (speed / 1000);
        if (maxDuration && maxDuration < duration) duration = maxDuration;
        timeline.add({
            targets: obj.obj,
            x: pos.x,
            y: pos.y,
            ease: 'Linear',
            duration: duration,
            onComplete: done
        })

        timeline.play()

        return promise
    }

    flyWithBounceTo(obj: O_GameObject, pos: Vec, speed: number, maxDuration?: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline();
        const distance = getDistanceBetween(obj, pos);
        let duration = distance / (speed / 1000);
        if (maxDuration && maxDuration < duration) duration = maxDuration;
        timeline.add({
            targets: obj.obj,
            x: pos.x,
            y: pos.y,
            ease: 'Bounce.easeOut',
            duration: duration,
            onComplete: done
        })

        timeline.play()

        return promise
    }

    jumpTo(obj: O_GameObject, pos: Vec): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline();
        const distance = getDistanceBetween(obj, pos);

        const duration = 400
        const height = distance / 3

        timeline.add({
            targets: obj.obj,
            x: pos.x,
            // y: pos.y,
            ease: 'Linear',
            duration: duration,
        })

        timeline.add({
            targets: obj.obj,
            y: pos.y - height,
            ease: 'Linear',
            duration: duration / 2,
            offset: 0,
        })

        timeline.add({
            targets: obj.obj,
            y: pos.y,
            ease: 'Linear',
            duration: duration / 2,
            offset: duration / 2,
            onComplete: done
        })

        timeline.play()

        return promise
    }

    thrownTo(obj: O_GameObject, pos: Vec, duration: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline();
        const distance = getDistanceBetween(obj, pos);

        timeline.add({
            targets: obj.obj,
            x: pos.x,
            // y: pos.y,
            ease: 'Linear',
            duration: duration,
            onComplete: done
        })

        timeline.add({
            targets: obj.obj,
            y: Math.min(obj.y, pos.y) - distance / 2,
            ease: 'Quad.easeOut',
            duration: duration / 3,
            offset: 0,
        })

        timeline.add({
            targets: obj.obj,
            y: pos.y,
            ease: 'Bounce.easeOut',
            duration: duration * 2 / 3,
            offset: duration / 3,
        })

        timeline.play()

        return promise
    }

    createPulseTimeline(targets: O_GameObject | O_GameObject[]) {
        const timeline = this.createTimeline()
        timeline.add({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeInOut',
            yoyo: true,
            repeat: -1,
            duration: 300,
            scale: 1.4
        })
        return timeline
    }

    bounceOfGround(obj: O_GameObject, height: number, duration: number) {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline();

        timeline.add({
            targets: obj.obj,
            y: obj.y - height,
            ease: 'Quad.easeOut',
            duration: duration / 3,
            offset: 0,
        })

        timeline.add({
            targets: obj.obj,
            y: obj.y,
            ease: 'Bounce.easeOut',
            duration: duration * 2 / 3,
            offset: duration / 3,
            onComplete: done
        })

        timeline.play()

        return promise
    }

    createJumpingTimeline(targets: O_GameObject | O_GameObject[], height = 10, repeat = -1) {
        const timeline = this.createTimeline()
        timeline.add({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeInOut',
            yoyo: true,
            repeat,
            duration: 200,
            y: '-=' + height
        })
        return timeline
    }

    fadeIn(targets: O_GameObject | O_GameObject[], duration = 500) {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline()
        timeline.add({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeOut',
            duration,
            alpha: 1,
            onComplete: done
        })
        timeline.play()
        return promise
    }
    fadeOut(targets: O_GameObject | O_GameObject[], duration = 500) {
        const {promise, done} = createPromiseAndHandlers()
        const timeline = this.createTimeline()
        timeline.add({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeOut',
            duration,
            alpha: 0,
            onComplete: done
        })
        timeline.play()
        return promise
    }
}