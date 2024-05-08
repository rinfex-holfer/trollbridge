import {o_} from "../managers/locator";
import {Meat} from "../entities/meat";
import {LayerKey} from "../managers/core/layers";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {colorsNum} from "../configs/constants";


type RottenEntity = Meat

export class EffectRotten {
    entity: RottenEntity
    gasEmitter: ParticleEmitter

    constructor(entity: RottenEntity) {
        this.entity = entity
        const center = this.entity.sprite.getCenter(true)
        this.gasEmitter = o_.game.getScene().add.particles(center.x, center.y, 'particle_smoke_green', {
            // this.gasEmitter = o_.game.getScene().add.particles(0, 0, 'particle_smoke_green', {
            x: {min: -20, max: 20},
            y: {min: -25, max: 15},
            scale: {min: 3, max: 5},
            angle: 270,
            speed: {min: 10, max: 50},
            frequency: 300,
            quantity: 5,
            lifespan: 500,
            emitting: false,
            // follow: this.entity.sprite.obj // this shit does not work with min-max coords
        })
        o_.layers.addRaw(this.gasEmitter, LayerKey.PARTICLES)
        this.subId = o_.time.sub(() => {
            const center = this.entity.sprite.getCenter(true)
            this.gasEmitter.x = center.x
            this.gasEmitter.y = center.y
        })
    }

    subId: number

    destroy() {
        o_.time.unsub(this.subId)
    }

    stopGas() {
        this.gasEmitter.emitting = false;
    }

    startGas() {
        this.gasEmitter.emitting = true;
    }

    setActive(val: boolean) {
        if (val) {
            this.gasEmitter.start()
            this.entity.sprite.obj.setTint(colorsNum.ROTTEN)
        } else {
            this.gasEmitter.stop()
            this.entity.sprite.obj.clearTint()
        }

    }
}