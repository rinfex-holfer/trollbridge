import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";
import {O_Container} from "./container";

const animations: {
    [atlas: string]: {
        [animation: string]: Phaser.Animations.Animation
    }
} = {}

export function getAnimKey(atlasKey: string, actionKey: string) {
    return atlasKey + '_' + actionKey
}

function createAnimations(
    scene: Phaser.Scene,
    options: {
        atlasKey: keyof typeof resoursePaths.atlases,
        animations: { framesPrefix: string, frameRate?: number, repeat?: number }[],
    }
) {

    animations[options.atlasKey] = {}

    const atlasTexture = scene.textures.get(options.atlasKey);

    options.animations.forEach(animation => {
        const framesNumber = Object.keys(atlasTexture.frames).filter(frameKey => {
            return frameKey.startsWith(animation.framesPrefix) && !isNaN(+frameKey[animation.framesPrefix.length])
        }).length

        const animationKey = getAnimKey(options.atlasKey, animation.framesPrefix);
        // console.log('create animation', animationKey);
        // animation
        // key: 'peasant_walk'
        // frames: 'walk_0' 'walk_1'

        // animations
        // { peasant: { walk: ...animation } }
        const animConfig = {
            key: animationKey,
            frames: scene.anims.generateFrameNames(options.atlasKey, {prefix: animation.framesPrefix, suffix: '.png', start: 1, end: framesNumber}),
            frameRate: animation.frameRate,
            repeat: animation.repeat
        };
        const anim = scene.anims.create(animConfig);
        if (!anim) {
            throw Error('wrong config for animation: ' + options.atlasKey + ' ' + animation.framesPrefix);
        }

        animations[options.atlasKey][animation.framesPrefix] = anim
    })
}

export class O_AnimatedSprite {
    obj: Phaser.GameObjects.Sprite

    atlasKey: keyof typeof resoursePaths.atlases

    constructor(
        private scene: Phaser.Scene,
        options: {
            atlasKey: keyof typeof resoursePaths.atlases,
            animations: { framesPrefix: string, frameRate?: number, repeat?: number }[],
            x: number,
            y: number,
            parent?: O_Container
        }
    ) {
        this.atlasKey = options.atlasKey;

        if (!animations[options.atlasKey]) createAnimations(scene, options);

        this.obj = new Phaser.GameObjects.Sprite(this.scene, options.x, options.y, options.atlasKey);
        if (options?.parent) {
            options.parent.add(this);
        }
        this.scene.add.existing(this.obj)
    }

    play(anim: string, options?: {onComplete?: () => void}) {
        console.log('play', anim, options)
        if (options?.onComplete) {
            this.obj.once('animationcomplete', () => {
                options?.onComplete && options.onComplete()
            })
        }
        this.obj.play(getAnimKey(this.atlasKey, anim));
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    setInteractive(val: boolean) {
        if (val) this.obj.setInteractive()
        else this.obj.disableInteractive()
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() { return this.obj.height }
    get width() { return this.obj.width }
    destroy() { this.obj.destroy() }
    addPhysics() { this.scene.physics.add.existing(this.obj) }
    // @ts-ignore
    stop() { this.obj.body.stop() }
    depthToY() { this.obj.depth = this.y }
}