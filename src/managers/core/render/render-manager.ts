import {getDistanceBetween, Vec} from "../../../utils/utils-math";
import {resoursePaths} from "../../../resourse-paths";
import Phaser from "phaser";
import {O_GameObject} from "./types";
import {O_Container} from "./container";
import {O_Sprite} from "./sprite";
import {O_AnimatedSprite} from "./animated-sprite";
import {Tiles} from "./tiles";
import {O_Text} from "./text";
import {o_} from "../../locator";
import {LayerKey} from "../layers";
import {createPromiseAndHandlers} from "../../../utils/utils-async";
import GameObject = Phaser.GameObjects.GameObject;

export class RenderManager {
    scene: Phaser.Scene

    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene) {
        this.scene = scene

        o_.register.render(this);

        const bloodParticles = this.scene.add.particles('particle_hit');
        this.bloodEmitter = bloodParticles.createEmitter({
            // **basic properties of particles**
            // **initial position**
            x: {min: -5, max: 5},             // { min, max }, or { min, max, steps }
            y: {min: -5, max: 5},             // { min, max }, or { min, max, steps }
            angle: { min: 0, max: 360 },  // { start, end, steps }
            speed: {min: 10, max: 100},                // { min, max }, or { min, max, steps }
            frequency: -1,      // -1 for exploding emitter
            quantity: 50,       // { min, max }
        });
        o_.layers.addRaw(bloodParticles, LayerKey.PARTICLES)
    }

    burstBlood(x: number, y: number) {
        this.bloodEmitter.explode(50, x, y);
    }

    moveTowards(obj: O_GameObject, x: number, y: number, speed: number, maxTime?: number) {
        this.scene.physics.moveTo(obj.obj, x, y, speed, maxTime);
    }

    directToTarget(obj: O_GameObject, target: Vec) {
        obj.obj.scaleX = Math.sign(target.x - obj.obj.x) || 1
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
        return new Tiles(this.scene, key, x, y, width, height);
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

    createJumpingTimeline(targets: O_GameObject | O_GameObject[]) {
        const timeline = this.createTimeline()
        timeline.add({
            targets: Array.isArray(targets) ? targets.map(t => t.obj) : targets.obj,
            ease: 'Power2.easeInOut',
            yoyo: true,
            repeat: -1,
            duration: 200,
            y: '-=10'
        })
        return timeline
    }
}