import {Container, GameSprite, ParticleContainer} from "../type-aliases";
import {getRndSign, rndBetween, rotate, Vec} from "../utils/utils-math";
import {resoursePaths} from "../resourse-paths";
// import * as PIXI from "pixi.js";
import {zLayers} from "../constants";
import {render} from "./render";

type ParticleEmitter = {
    container: ParticleContainer,
    particles: Particle[],
    path: string,
    id: string,
    speed: number,
    maxScale: number,
    lifespan: number,
    maxParticles: number,
    coord: Vec,
    direction: Vec,
    spread: number,
    started: boolean,
    minAlpha?: number
    burst?: boolean
}

type Particle = {
    time: number,
    sprite: GameSprite,
    direction: Vec,
    speed: number,
    stale: boolean
}

type CreateEmitterOptions = {
    id: string,
    path: string,
    speed: number,
    lifespan: number
    maxParticles: number
    coord: Vec
    direction: Vec,
    spread: number,
    maxScale: number,
    container?: Container,
    minAlpha?: number,
    burst?: boolean,
}

class ParticleManager {
    emitters = {} as {[entityId: string]: ParticleEmitter};

    update(dt: number) {
        this.updateEmitters(dt);
    }

    getEmitter(id: string) {
        return this.emitters[id];
    }

    updateEmitters(dt: number) {
        Object.values(this.emitters).forEach(e => this.updateEmitter(e, dt));
    }

    createEmitter(options: CreateEmitterOptions) {
        // @ts-ignore
        const container = new PIXI.ParticleContainer(options.maxParticles, {});
        container.zIndex = zLayers.PARTICLES;
        container.position.set(options.coord.x, options.coord.y);
        (options.container || render.pixiApp.stage).addChild(container);

        this.emitters[options.id] =  {
            ...options,
            started: true,
            container,
            particles: [],
        };

        if (options.burst) {
            for (let i = 0; i < options.maxParticles; i++) {
                this.createParticle(this.emitters[options.id]);
            }
        }
    };

    // onMove: MessageHandler<MessageType.MOVE_ENTITY> = payload => {
    //     const data: Entity.WITH_PARTICLE_EMITTER = getEntityData(payload.entityId);
    //
    //     if (!data || !data.particleEmitter) {
    //         return;
    //     }
    //
    //     data.particleEmitter.x = payload.x + data.particleEmitter.shift.x;
    //     data.particleEmitter.y = payload.y + data.particleEmitter.shift.y;
    //     // const coord = this.getInitialCoord(data);
    //
    //     // const emitter = this.getEmitter(data.entityId);
    //     // emitter.container.position.set(coord.x, coord.y);
    //     // emitter.coord.x = coord.x;
    //     // emitter.coord.y = coord.y;
    // };

    createBlockBurst(id: string, x: number, y: number) {
        this.createEmitter({
            id,
            path: resoursePaths.images.particle_smoke,
            burst: true,
            maxParticles: 20,
            minAlpha: 0.2,
            coord: {x, y},
            maxScale: 1,
            speed: 300,
            lifespan: 100,
            direction: {x: 0, y: -1},
            spread: 2 * Math.PI,
        })
    }

    createHitBurst(id: string, x: number, y: number) {
        this.createEmitter({
            id,
            path: resoursePaths.images.particle_hit,
            burst: true,
            maxParticles: 50,
            minAlpha: 0.2,
            coord: {x, y},
            maxScale: 1,
            speed: 300,
            lifespan: 200,
            direction: {x: 0, y: -1},
            spread: 2 * Math.PI,
        })
    }

    changeEmitter(id: string, options?: any) {
        const emitter = this.getEmitter(id);
        if (!emitter) return;

        if (options.maxParticles !== undefined) {
            emitter.maxParticles  = options.maxParticles;
        }

        if (options.lifespan !== undefined) {
            emitter.lifespan  = options.lifespan;
        }

        if (options.minAlpha !== undefined) {
            emitter.minAlpha = options.minAlpha;
        }
    }

    startEmitter(id: string) {
        if (this.emitters[id]) {
            this.emitters[id].started = true;
        } else {
            console.warn('no emitter with id', id);
        }
    };

    stopEmitter(id: string) {
        if (this.emitters[id]) {
            this.emitters[id].started = false;
        } else {
            console.warn('no emitter with id', id);
        }
    };

    // getInitialCoord = (data: Entity.WITH_PARTICLE_EMITTER) => ({
    //     x: data.particleEmitter.x + data.particleEmitter.shift.x,
    //     y: data.particleEmitter.y + data.particleEmitter.shift.y,
    // });

    updateEmitter(emitter: ParticleEmitter, dt: number) {
        if (emitter.burst) {
            return this.updateBurstEmitter(emitter, dt);
        }

        if (emitter.started && emitter.particles.length < emitter.maxParticles) {
            this.createParticle(emitter);
        }

        emitter.particles.forEach(p => this.updateParticle(p, dt, emitter));
        emitter.particles = emitter.particles.filter(p => !p.stale);
    };

    updateBurstEmitter = (emitter: ParticleEmitter, dt: number) => {
        emitter.particles.forEach(p => this.updateParticle(p, dt, emitter));
        emitter.particles = emitter.particles.filter(p => !p.stale);
        if (emitter.particles.length === 0) {
            this.deleteEmitter(emitter.id);
        }
    };

    createParticle(emitter: ParticleEmitter) {
        // @ts-ignore
        const sprite = new GameSprite(render.getTexture(emitter.path));
        sprite.position.set(0, 0);
        emitter.container.addChild(sprite);

        const direction = rotate(emitter.direction, Math.random() * emitter.spread / 2 * getRndSign());

        emitter.particles.push({
            sprite,
            time: 0,
            speed: rndBetween(emitter.speed, emitter.speed/2),
            direction,
            stale: false
        });

        emitter.container.addChild(sprite);
    };

    updateParticle = (particle: Particle, dt: number, emitter: ParticleEmitter) => {
        particle.time += dt;

        if (particle.time >= emitter.lifespan) {
            particle.sprite.destroy();
            particle.stale = true;
            return;
        }

        if (emitter.maxScale > 1) {
            const scaleAdd = (dt / emitter.lifespan) * (emitter.maxScale - 1);
            particle.sprite.scale.x += scaleAdd;
            particle.sprite.scale.y += scaleAdd;
        }

        if (emitter.minAlpha !== undefined) {
            particle.sprite.alpha = 1 - (particle.time / emitter.lifespan) * (1 - emitter.minAlpha);
        }

        particle.sprite.x = particle.sprite.x + particle.direction.x * particle.speed * dt / 1000;
        particle.sprite.y = particle.sprite.y + particle.direction.y * particle.speed * dt / 1000;
    };

    deleteEmitter(entityId: string) {
        const emitter: ParticleEmitter = this.emitters[entityId];
        if (!emitter) {
            return;
        }

        emitter.container.destroy({children: true});
        delete this.emitters[entityId];
    };
}

export const particleManager = new ParticleManager();


