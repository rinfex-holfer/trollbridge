import {render} from "./render";
import * as Phaser from "phaser";

class ParticleManager {
    // @ts-ignore
    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter

    // @ts-ignore
    scene: Phaser.Scene

    init(scene: Phaser.Scene) {
        this.scene = scene;

        const bloodParticles = render.scene.add.particles('particle_hit');
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
    }

    burstBlood(x: number, y: number) {
        this.bloodEmitter.explode(50, x, y);
    }
}

export const particleManager = new ParticleManager();


