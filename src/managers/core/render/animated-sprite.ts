import Phaser from "phaser";
import {resoursePaths} from "../../../resourse-paths";
import {O_Container} from "./container";
import Pointer = Phaser.Input.Pointer;

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
        const animationKey = getAnimKey(options.atlasKey, animation.framesPrefix);

        const framesNumber = Object.keys(atlasTexture.frames).filter(frameKey => {
            return frameKey.startsWith(animationKey) && !isNaN(+frameKey[animationKey.length + 1])
        }).length

        const animConfig = {
            key: animationKey,
            frames: scene.anims.generateFrameNames(options.atlasKey, {prefix: animationKey + '_', suffix: '.png', end: framesNumber-1}),
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
        // TODO put to ELSE branch when https://github.com/photonstorm/phaser/issues/5803 will be resolved
        this.scene.add.existing(this.obj)
    }

    play(anim: string, options?: {onComplete?: () => void}) {
        if (options?.onComplete) {
            this.obj.once('animationcomplete', () => {
                options?.onComplete && options.onComplete()
            })
        }
        this.obj.play(getAnimKey(this.atlasKey, anim));
    }

    stopAnimation() {
        this.obj.stop()
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    setInteractive(val: boolean, options?: any) {
        if (val) this.obj.setInteractive(options)
        else this.obj.disableInteractive()
    }

    leftClickCb: ((pointer: Pointer) => void) | null = null
    onClick(callback: () => void) {
        if (this.leftClickCb) this.obj.removeListener('pointerdown', this.leftClickCb)

        this.leftClickCb = (pointer: Pointer) => {
            if (!pointer.rightButtonDown()) callback()
        }

        this.obj.on('pointerdown', this.leftClickCb)
    }
    removeClickListener() { this.obj.removeListener('pointerdown') }

    rightClickCb: ((pointer: Pointer) => void) | null = null
    onRightClick(callback: () => void) {
        if (this.rightClickCb) this.obj.removeListener('pointerdown', this.rightClickCb)

        this.rightClickCb = (pointer: Pointer) => {
            if (pointer.rightButtonDown()) callback()
        }

        this.obj.on('pointerdown', this.rightClickCb)
    }

    onPointerOver(callback: () => void) {
        this.obj.removeListener('pointerover')
        this.obj.on('pointerover', callback)
    }

    onPointerOut(callback: () => void) {
        this.obj.removeListener('pointerout')
        this.obj.on('pointerout', callback)
    }

    setOrigin(x: number, y: number) { this.obj.setOrigin(x, y)}
    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() { return this.obj.height }
    get width() { return this.obj.width }
    get alpha() { return this.obj.alpha }
    set alpha(val: number) { this.obj.alpha = val }
    setVisibility(val: boolean) { this.obj.visible = val }
    destroy() { this.obj.destroy() }
    addPhysics() { this.scene.physics.add.existing(this.obj) }
    // @ts-ignore
    stop() { this.obj.body.stop() }
    depthToY() { this.obj.depth = this.y }
}