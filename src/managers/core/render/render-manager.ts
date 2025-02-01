import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {resoursePaths} from "../../../resourse-paths";
import Phaser from "phaser";
import {O_GameObject} from "./types";
import {O_Container} from "./container";
import {O_Sprite} from "./sprite";
import {O_AnimatedSprite} from "./animated-sprite";
import {O_Tiles} from "./tiles";
import {O_Text} from "./text";
import {o_} from "../../locator";
import {LayerKey} from "../layers";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import GameObject = Phaser.GameObjects.GameObject;
import {stub} from "../../../utils/utils-misc";
import {ImageKey} from "../../../utils/utils-types";
import {TextKey} from "../../../translations";

export class RenderManager {
    scene: Phaser.Scene

    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter
    yellowEmitter: Phaser.GameObjects.Particles.ParticleEmitter
    greenSmokeParticles: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene) {
        this.scene = scene

        o_.register.render(this);

        // const bloodParticles =
        this.bloodEmitter = this.scene.add.particles(
            0,
            0,
            'particle_blood',
            {
                lifespan: 300,
                frequency: -1,
                quantity: 50,
                angle: {min: 0, max: 360},
                speed: {min: 100, max: 300},
            }
        );
        o_.layers.addRaw(this.bloodEmitter, LayerKey.PARTICLES)

        this.yellowEmitter = this.scene.add.particles(
            0,
            0,
            'particle_hit',
            {
                angle: {min: 250, max: 290},
                speed: {min: 600, max: 800},
                gravityY: 2400,
                frequency: -1,
                quantity: 50,
                lifespan: 500,
            },
        );
        o_.layers.addRaw(this.yellowEmitter, LayerKey.PARTICLES)

        this.greenSmokeParticles = this.scene.add.particles(0, 0, 'particle_smoke_green');
        o_.layers.addRaw(this.greenSmokeParticles, LayerKey.PARTICLES)
    }

    // for debugging purposes
    createOutline(obj: O_Sprite | O_AnimatedSprite) {
        let graphics = this.scene.add.graphics({lineStyle: {width: 2, color: 0xaa0000}, fillStyle: {color: 0x0000aa}});
        const rect = new Phaser.Geom.Rectangle();

        let bounds = obj.getBounds();
        rect.x = bounds.x
        rect.y = bounds.y
        rect.width = bounds.width
        rect.height = bounds.height
        // graphics.strokeRect(bounds.x - 10, bounds.y - 10, bounds.width + 20, bounds.height + 20);
        // graphics.fill()
        graphics.strokeRectShape(rect);
        // console.log(bounds);

        let subId = -1;
        const onUpdate = () => {
            graphics.clear();
            const bounds = obj.getBounds();
            rect.width = bounds.width;
            rect.height = bounds.height;
            rect.y = bounds.y
            rect.x = bounds.x
            graphics.strokeRectShape(rect);
            if (!obj.obj.active) {
                graphics.clear();
                o_.time.unsub(subId)
            }
        }
        subId = o_.time.sub(onUpdate)
    }

    createGreenSmokeEmitter() {
        return this.greenSmokeParticles
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
        const currentXScaleModule = Math.abs(obj.obj.scaleX)
        const diff = target.x - (obj.obj.x + (offset || 0))
        obj.obj.scaleX = Math.sign(diff) * currentXScaleModule || currentXScaleModule
    }

    createContainer(x: number, y: number, options?: { parent?: O_Container }) {
        return new O_Container(this.scene, x, y, options)
    }

    createSprite(key: ImageKey, x: number, y: number, options?: {
        width?: number,
        height?: number,
        parent?: O_Container
    }) {
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

    createText(options: {
        textKey: TextKey,
        textVars?: any,
        x: number,
        y: number,
        style: Phaser.Types.GameObjects.Text.TextStyle,
        parent?: O_Container
    }) {
        return new O_Text(this.scene, options);
    }

    createTween(config: Phaser.Types.Tweens.TweenBuilderConfig) {
        const defaults = {
            paused: true
        }
        return this.scene.tweens.add({
            ...defaults,
            ...config
        })
    }

    createTweenChain(tweens: Phaser.Types.Tweens.TweenBuilderConfig[]) {
        return this.scene.tweens.chain({
            tweens
        })
    }

    flyTo(obj: O_GameObject, pos: Vec, speed: number, maxDuration?: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const distance = getDistanceBetween(obj, pos);
        let duration = distance / (speed / 1000);
        if (maxDuration && maxDuration < duration) duration = maxDuration;
        const tween = this.createTween({
            targets: obj.obj,
            x: pos.x,
            y: pos.y,
            ease: 'Linear',
            duration: duration,
            onComplete: done,
        })
        tween.play();

        return promise
    }

    flyWithBounceTo(obj: O_GameObject, pos: Vec, speed: number, maxDuration?: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const distance = getDistanceBetween(obj, pos);
        let duration = distance / (speed / 1000);
        if (maxDuration && maxDuration < duration) duration = maxDuration;
        const tween = this.createTween({
            targets: obj.obj,
            x: pos.x,
            y: pos.y,
            ease: 'Bounce.easeOut',
            duration: duration,
            onComplete: done
        })

        tween.play()

        return promise
    }

    jumpHorizontallyTo(obj: O_GameObject, pos: Vec): Promise<any> {
        const {promise: promiseX, done: doneX} = createPromiseAndHandlers<any>()
        const {promise: promiseY, done: doneY} = createPromiseAndHandlers<any>()
        const distance = getDistanceBetween(obj, pos);

        const duration = 400
        const height = distance / 3

        const tweenX = this.createTween({
            targets: obj.obj,
            x: pos.x,
            ease: 'Linear',
            duration: duration,
            onComplete: doneX
        })
        const tweenY = this.createTweenChain([
            {
                targets: obj.obj,
                y: pos.y - height,
                ease: 'Linear',
                duration: duration / 2,
                offset: 0,
            },
            {
                targets: obj.obj,
                y: pos.y,
                ease: 'Linear',
                duration: duration / 2,
                offset: duration / 2,
                onComplete: doneY
            }
        ])
        tweenX.play()
        tweenY.play()

        return Promise.all([promiseX, promiseY])
    }

    jumpDownTo(obj: O_GameObject, pos: Vec, options?: { duration?: number, speed?: number }): Promise<any> {
        const startY = obj.obj.y;
        const targetY = pos.y;
        const jumpDepth = 150;    // how much extra dip at the middle

        const distance = getDistanceBetween(obj, pos);

        const duration = options?.duration
            ? options?.duration
            : options?.speed
                ? distance / options.speed
                : 400;


        const {promise: promiseX, done: doneX} = createPromiseAndHandlers<any>()
        const {promise: promiseY, done: doneY} = createPromiseAndHandlers<any>()


        const tweenX = this.createTween({
            targets: obj.obj,
            x: pos.x,
            ease: 'Linear',
            duration: duration,
            onComplete: doneX
        })

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: duration,
            onUpdate: tween => {
                const t = tween.getValue();
                const linearY = startY + (targetY - startY) * t;
                const arcOffset = -jumpDepth * (4 * t * (1 - t));
                obj.obj.y = linearY + arcOffset;
            },
            onComplete: doneY
        });
        tweenX.play()

        return Promise.all([promiseX, promiseY])
    }

    jumpUpTo(obj: O_GameObject, pos: Vec, options?: { duration?: number, speed?: number }): Promise<any> {
        const startY = obj.obj.y;
        const targetY = pos.y;

        const {promise: promiseX, done: doneX} = createPromiseAndHandlers<any>()
        const {promise: promiseY, done: doneY} = createPromiseAndHandlers<any>()
        const distance = getDistanceBetween(obj, pos);

        const duration = options?.duration
            ? options?.duration
            : options?.speed
                ? distance / options.speed
                : 400;

        const jumpHeight = 100

        const tweenX = this.createTween({
            targets: obj.obj,
            x: pos.x,
            ease: 'Linear',
            duration: duration,
            onComplete: doneX
        })

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: duration,
            onUpdate: tween => {
                const t = tween.getValue();
                // Linear interpolation between start and target y
                const linearY = startY + (targetY - startY) * t;
                // Parabolic offset: peaks at t = 0.5. Negative offset lifts the jump (assuming smaller y = higher on screen)
                const arcOffset = -jumpHeight * (4 * t * (1 - t));
                obj.obj.y = linearY + arcOffset;
            },
            onComplete: doneY
        });
        tweenX.play()

        return Promise.all([promiseX, promiseY])
        // return Promise.all([promiseY])
    }

    thrownTo(obj: O_GameObject, pos: Vec, duration: number): Promise<any> {
        const {promise, done} = createPromiseAndHandlers()
        const distance = getDistanceBetween(obj, pos);

        const tweenX = this.createTween({
            targets: obj.obj,
            x: pos.x,
            // y: pos.y,
            ease: 'Linear',
            duration: duration,
            onComplete: done
        });
        const tweenY = this.createTweenChain([
            {
                targets: obj.obj,
                y: Math.min(obj.y, pos.y) - distance / 2,
                ease: 'Quad.easeOut',
                duration: duration / 3,
            },
            {
                targets: obj.obj,
                y: pos.y,
                ease: 'Bounce.easeOut',
                duration: duration * 2 / 3,
            }
        ]);

        tweenX.play();
        tweenY.play();

        return promise
    }

    createPulseTween(targets: O_GameObject | O_GameObject[]) {
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeInOut',
            yoyo: true,
            repeat: -1,
            duration: 300,
            scale: 1.4
        })
        return tween
    }

    bounceOfGround(obj: O_GameObject, height: number, duration: number) {
        const {promise, done} = createPromiseAndHandlers()
        const tween = this.createTweenChain([
            {
                targets: obj.obj,
                y: obj.y - height,
                ease: 'Quad.easeOut',
                duration: duration / 3,
                offset: 0,
            },
            {
                targets: obj.obj,
                y: obj.y,
                ease: 'Bounce.easeOut',
                duration: duration * 2 / 3,
                offset: duration / 3,
                onComplete: done
            }
        ]);

        tween.play()

        return promise
    }

    createJumpingTween(targets: O_GameObject | O_GameObject[], height = 10, repeat = -1) {
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeInOut',
            yoyo: true,
            repeat,
            duration: 200,
            y: '-=' + height,
        })
        return tween
    }

    createUpDownMovementTween(targets: O_GameObject | O_GameObject[], height = 10, duration = 500) {
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
            duration,
            y: `-=${height}`,
        })
        return tween
    }

    createZzzTween(targets: O_GameObject[], x: number, y: number) {
        const getConfig = (i: number) => (
            {
                targets: targets[i],
                ease: 'Linear',
                alpha: 0,
                y,
                duration: 6000,
                repeat: -1,
                offset: i * 2000,
                onStart: () => targets[i].setVisibility(true)
            });
        const getYoyoConfig = (i: number) => ({
            targets: targets[i],
            ease: 'Sine.easeInOut',
            yoyo: true,
            x,
            duration: 1500,
            repeat: -1,
            offset: i * 2000
        })

        const tweenChain = this.createTweenChain([
            getConfig(0),
            getYoyoConfig(0),
            getConfig(1),
            getYoyoConfig(1),
            getConfig(2),
            getYoyoConfig(2),
        ])
        return tweenChain;
    }

    fadeInFromBottom(targets: O_GameObject | O_GameObject[], duration = 500, height = 30) {
        const {promise, done} = createPromiseAndHandlers<any>()
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeOut',
            duration,
            alpha: 1,
            y: '-=' + height,
            onComplete: done
        })
        tween.play()
        return promise
    }

    fadeIn(targets: O_GameObject | O_GameObject[], duration = 500) {
        const {promise, done} = createPromiseAndHandlers<any>()
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeOut',
            duration,
            alpha: 1,
            onComplete: done
        })
        tween.play()
        return promise
    }

    fadeOut(targets: O_GameObject | O_GameObject[], duration = 500) {
        const {promise, done} = createPromiseAndHandlers()
        const tween = this.createTween({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeOut',
            duration,
            alpha: 0,
            onComplete: done
        })
        tween.play()
        return promise
    }
}