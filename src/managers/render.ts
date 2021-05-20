import {
    getDistanceBetween,
    getNormalizedVector,
    getVector, getVectorLength,
    Vec
} from "../utils/utils-math";
import {resoursePaths} from "../resourse-paths";
import Phaser from "phaser";
import {CharAnimation} from "../char/char-constants";

type GameObject = Container | Sprite | AnimatedSprite | GameText;

export class Container {
    obj: Phaser.GameObjects.Container

    constructor(x: number, y: number, options?: {parent?: Container}) {
        this.obj = new Phaser.GameObjects.Container(render.scene, x, y);
        if (options?.parent) {
            options.parent.add(this)
        } else {
            render.scene.add.existing(this.obj);
        }
    }

    setInteractive(val: boolean, options?: any, options2?: any) {
        if (val) this.obj.setInteractive(options, options2)
        else this.obj.disableInteractive()
    }

    add(obj: GameObject) {
        this.obj.add(obj.obj)
    }

    onClick(callback: () => void) {
        this.obj.on('pointerdown', callback)
    }

    onPointerOver(callback: () => void) {
        this.obj.on('pointerover', callback)
    }

    onPointerOut(callback: () => void) {
        this.obj.on('pointerout', callback)
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    getCoords() {
        return {x: this.obj.x, y: this.obj.y}
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() {return this.obj.height }
    get width() {return this.obj.width }
    destroy() { this.obj.destroy() }
    addPhysics() { render.scene.physics.add.existing(this.obj) }
}

export class GameText {
    obj: Phaser.GameObjects.Text

    constructor(text: string, x: number, y: number, style: Phaser.Types.GameObjects.Text.TextStyle, options?: {parent?: Container}) {
        this.obj = new Phaser.GameObjects.Text(render.scene, x, y, text, style);

        if (options?.parent) {
            options.parent.add(this)
        }
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setText(str: string) {
        this.obj.text = str;
    }

    addPhysics() { render.scene.physics.add.existing(this.obj) }
}

export class Sprite {
    obj: Phaser.GameObjects.Sprite

    constructor(key: keyof typeof resoursePaths.images, x: number, y: number, options?: {width?: number, height?: number, parent?: Container}) {
        this.obj = new Phaser.GameObjects.Sprite(render.scene, x, y, key);

        if (options?.parent) {
            this.obj = new Phaser.GameObjects.Sprite(render.scene, x, y, key);
            options.parent.add(this);
        } else {
            this.obj = render.scene.add.sprite(x, y, key)
        }

        if (options?.width) this.obj.displayWidth = options.width;
        if (options?.height) this.obj.displayHeight = options.height;
    }

    setInteractive(val: boolean, options?: any) {
        if (val) this.obj.setInteractive(options)
        else this.obj.disableInteractive()
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    move(x: number, y: number) {
        this.obj.setPosition(x, y);
    }

    onClick(callback: () => void) {
        this.obj.on('pointerdown', callback)
    }

    onPointerOver(callback: () => void) {
        this.obj.on('pointerover', callback)
    }

    onPointerOut(callback: () => void) {
        this.obj.on('pointerout', callback)
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    get x() { return this.obj.x }
    set x(x) { this.obj.x = x }
    get y() { return this.obj.y }
    set y(y) { this.obj.y = y }
    get height() {return this.obj.height }
    get width() {return this.obj.width }
    destroy() { this.obj.destroy() }
    addPhysics() { render.scene.physics.add.existing(this.obj) }
}

export class TileSprite {
    obj: Phaser.GameObjects.TileSprite

    constructor(key: keyof typeof resoursePaths.images, x: number, y: number, width: number, height: number) {
        this.obj = render.scene.add.tileSprite(x, y, width, height, key);
    }

    setInteractive(val: boolean, options?: any) {
        if (val) this.obj.setInteractive(options)
        else this.obj.disableInteractive()
    }

    onClick(callback: () => void) {
        this.obj.on('pointerdown', callback)
    }

    setOrigin(x: number, y: number) {
        this.obj.setOrigin(x, y)
    }

    setVisibility(val: boolean) {
        this.obj.visible = val;
    }

    addPhysics() { render.scene.physics.add.existing(this.obj) }
}

export class AnimatedSprite {
    obj: Phaser.GameObjects.Sprite

    constructor(
        options: {
            key: keyof typeof resoursePaths.atlases,
            animations: { key: string, frameRate?: number, repeat?: number }[],
            x: number,
            y: number,
            parent?: Container
        }
    ) {
        if (!render.animations[options.key]) render.createAnimations(options);

        this.obj = new Phaser.GameObjects.Sprite(render.scene, options.x, options.y, options.key);
        if (options?.parent) {
            options.parent.add(this);
        } else {
            render.scene.add.existing(this.obj)
        }
    }

    play(anim: string) {
        console.log('play', anim)
        this.obj.play(anim);
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

    get x() {
        return this.obj.x
    }

    set x(x) {
        this.obj.x = x
    }

    get y() {
        return this.obj.y
    }

    set y(y) {
        this.obj.y = y
    }

    get height() {
        return this.obj.height
    }

    get width() {
        return this.obj.width
    }

    destroy() {
        this.obj.destroy()
    }

    addPhysics() { render.scene.physics.add.existing(this.obj) }
}

class RenderManager {

    // @ts-ignore
    scene: Phaser.Scene

    animations: {
        [atlas: string]: {
            [animation: string]: Phaser.Animations.Animation
        }
    } = {}

    init(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createAnimations(
        options: {
            key: keyof typeof resoursePaths.atlases,
            animations: { key: string, frameRate?: number, repeat?: number }[],
        }
    ) {

        this.animations[options.key] = {}

        const atlasTexture = this.scene.textures.get(options.key);

        options.animations.forEach(animation => {
            const framesNumber = Object.keys(atlasTexture.frames).filter(frameKey => {
                return frameKey.startsWith(animation.key) && !isNaN(+frameKey[animation.key.length])
            }).length
            console.log('create animation', options.key + '_' + animation.key);
            const animConfig = {
                key: options.key + '_' + animation.key,
                frames: this.scene.anims.generateFrameNames(options.key, {prefix: animation.key, suffix: '.png', start: 1, end: framesNumber}),
                frameRate: animation.frameRate,
                repeat: animation.repeat
            };
            const anim = this.scene.anims.create(animConfig);
            if (!anim) throw Error('wrong config for animation: ' + animation.key);

            this.animations[options.key][animation.key] = anim
        })
    }

    moveTowards(obj: GameObject, x: number, y: number, speed: number, maxTime?: number) {
        this.scene.physics.moveTo(obj.obj, x, y, speed, maxTime);
    }

    directToTarget(obj: GameObject, target: Vec) {
        obj.obj.scaleX = Math.sign(target.x - obj.obj.x);
    }

    // createAnimatedSprite(textureKey: keyof typeof resoursePaths.atlases, animName: string, frameRate: number, repeat) {
        // options = {...animationDefaultOptions, ...options};
        // const {entityId, x, y, path, animationSpeed, anchor, currentAnimation, autoplay, onEnd} = options;
        //
        // const sheet = this.getSpritesheet(path);
        // const map: {[key: string]: PIXI.AnimatedSprite} = {};
        //
        // const container = this.createContainer(entityId);
        // container.x = x;
        // container.y = y;
        //
        // if (!sheet) {
        //     throw Error('wrong spritesheet ' + path);
        // }
        //
        // Object.keys(sheet.animations).forEach(animationKey => {
        //     const animatedSprite: PIXI.AnimatedSprite = new PIXI.AnimatedSprite(sheet.animations[animationKey]);
        //
        //     animatedSprite.animationSpeed = animationSpeed;
        //     animatedSprite.renderable = animationKey === currentAnimation;
        //
        //     if (anchor) {
        //         animatedSprite.anchor.set(anchor.x, anchor.y);
        //     }
        //
        //     if (options.ySorting) {
        //         animatedSprite.zIndex = zLayers.GAME_OBJECTS_MIN + Math.round(y);
        //     }
        //
        //     if (animationKey === currentAnimation && autoplay) {
        //         animatedSprite.play();
        //         if (onEnd) {
        //             animatedSprite.loop = false;
        //             animatedSprite.onComplete = onEnd;
        //         }
        //     }
        //
        //     map[animationKey] = animatedSprite;
        //     container.addChild(animatedSprite);
        // });
        //
        // this.setAnimations(entityId, map);
        //
        // return map;
    // }
    //
    // changeAnimation(
    //     options:
    //     {entityId: string, animationName: string, time?: number, onLoop?: () => void, onComplete?: () => void, loop?: boolean}
    // ) {
    //     const oldAnimation = this.getCurrentAnimation(options.entityId);
    //     const newAnimation = this.getAnimation(options.entityId, options.animationName);
    //
    //     if (oldAnimation === newAnimation) return;
    //
    //     if (oldAnimation) {
    //         oldAnimation.onLoop = undefined;
    //         oldAnimation.gotoAndStop(0);
    //         oldAnimation.renderable = false;
    //         oldAnimation.interactive = false;
    //
    //         newAnimation.scale.x = oldAnimation.scale.x;
    //         newAnimation.scale.y = oldAnimation.scale.y;
    //         newAnimation.interactive = oldAnimation.interactive;
    //     }
    //
    //     if (options.loop === false) {
    //         newAnimation.loop = false;
    //     }
    //
    //     newAnimation.gotoAndPlay(0);
    //     newAnimation.renderable = true;
    //
    //     if (options.time !== undefined) {
    //         const oneFrameDuration = (1000 / 60);
    //         const oneFrameDurationShouldBe = (options.time / newAnimation.textures.length);
    //         newAnimation.animationSpeed = ceilTo(oneFrameDuration / oneFrameDurationShouldBe, 2);
    //     }
    //
    //     if (options.onLoop) newAnimation.onLoop = options.onLoop
    //     if (options.onComplete) newAnimation.onComplete = options.onComplete;
    // }
    //
    // hideAnimation(entityId: string) {
    //     const anim = this.getCurrentAnimation(entityId);
    //     if (anim) anim.renderable = false;
    // }
    //
    // changeSpriteVisibility(entityId: string, val: boolean) {
    //     this.getSprite(entityId).renderable = val;
    // }
    //
    // changeContainerVisibility(entityId: string, val: boolean) {
    //     this.getContainer(entityId).renderable = val;
    // }
    //
    //
    // setInteractive(containerId: string, interactive: boolean, buttonMode = interactive){
    //     const c = this.getContainer(containerId);
    //     c.buttonMode = buttonMode;
    //     c.interactive = interactive;
    // }
    //
    // moveSprite(entityId: string, x: number, y: number) {
    //     const container = this.getSprite(entityId);
    //
    //     container.x = x;
    //     container.y = y;
    // }
    //
    // move(entityId: string, x: number, y: number, ySorting = false) {
    //     const container = this.getContainer(entityId);
    //
    //     container.x = x;
    //     container.y = y;
    //
    //     if (ySorting) {
    //         container.zIndex = zLayers.GAME_OBJECTS_MIN + Math.round(y);
    //     }
    // }
    //
    //
    // createContainer(entityId: string, parentId?: string): PIXI.Container {
    //
    //     let parent = this.pixiApp.stage;
    //     if (parentId) {
    //         parent = this.getContainer(parentId);
    //     }
    //
    //     const container = this.createContainerNew(parent);
    //
    //     this.setContainer(entityId, container);
    //     return container;
    // }
    //
    // createContainerNew(parent?: PIXI.Container): PIXI.Container {
    //     const container = new PIXI.Container();
    //     (parent || this.pixiApp.stage).addChild(container);
    //     return container;
    // }
    //
    // getContainer(entityId: string): PIXI.Container {
    //     return this.containersMap[entityId];
    // };
    //
    // getSprite(entityId: string) {
    //     return this.spriteMap[entityId]
    // }
    //
    // getAllAnimations(entityId: string): PIXI.AnimatedSprite[] {
    //     return Object.values(this.animationsMap[entityId])
    // }
    //
    // getCurrentAnimation(entityId: string) : PIXI.AnimatedSprite | null {
    //     const animName = Object.keys(this.animationsMap[entityId]).find(aName => {
    //         return this.animationsMap[entityId][aName].renderable
    //     })
    //     return animName ? this.animationsMap[entityId][animName] : null;
    // }
    //
    // getAnimation(entityId: string, animationName: string): PIXI.AnimatedSprite {
    //     return this.animationsMap[entityId][animationName];
    // }
    //
    // setSprite(entityId: string, sprite: PIXI.Sprite) {
    //     this.spriteMap[entityId] = sprite;
    // }
    //
    // setAnimations(entityId: string, animations: {[propName: string]: PIXI.AnimatedSprite}) {
    //     this.animationsMap[entityId] = animations;
    // }
    //
    // setTiles(entityId: string, tiles: PIXI.Container) {
    //     this.tilesMap[entityId] = tiles;
    // };
    //
    // setContainer(entityId: string, container: PIXI.Container) {
    //     if (this.containersMap[entityId]) {
    //         console.warn(`container with id ${entityId} already exists`);
    //     }
    //
    //     this.containersMap[entityId] = container;
    // };
    //
    // createTiles(options: TileOptions) {
    //     options = {...tileDefaultOptions, ...options};
    //     const {width, height, paths, container, cacheAsBitmap, x, y, entityId} = options;
    //     const texture = this.getTexture(paths[0]);
    //     if (!texture) throw Error('no such texture: ' + paths[0])
    //     const TILE_WIDTH = texture.width;
    //     const TILE_HEIGHT = texture.height;
    //
    //
    //
    //     const tiles = new PIXI.TilingSprite(texture, width, height);
    //     tiles.position.set(x, y);
    //
    //
    //     // for (let col = 0; col < Math.ceil(width / TILE_WIDTH); col++) {
    //     //     for (let row = 0; row < Math.ceil(height / TILE_HEIGHT); row++) {
    //     //         this.createSprite({
    //     //             entityId: createId(entityId+'_tile'),
    //     //             path: getRndItem(paths),
    //     //             x: col * TILE_WIDTH,
    //     //             y: row * TILE_HEIGHT,
    //     //             container: tiles,
    //     //             anchor: {x: 0, y: 0}
    //     //         });
    //     //     }
    //     // }
    //
    //     (container || this.pixiApp.stage).addChild(tiles);
    //     //
    //     // if (cacheAsBitmap) {
    //     //     tiles.cacheAsBitmap = true;
    //     // }
    //
    //     return tiles;
    // };
    //
    // createText(text: string, x: number, y: number, style?: any, parent?: PIXI.Container) {
    //     const pixiText = new PIXI.Text(text, style || {});
    //     pixiText.x = x;
    //     pixiText.y = y;
    //     (parent || this.pixiApp.stage).addChild(pixiText);
    //     return pixiText;
    // }
    //
    // createSprite(options: SpriteOptions) {
    //     options = {...spriteDefaultOptions, ...options};
    //     const {container, path, x, y, anchor, entityId} = options;
    //     let texture = this.getTexture(path);
    //     if (!texture) {
    //         throw Error('no texture for ' + path);
    //     }
    //     const sprite = new PIXI.Sprite(texture);
    //     (container || this.pixiApp.stage).addChild(sprite);
    //
    //     if (anchor) {
    //         sprite.anchor.set(anchor.x, anchor.y)
    //     }
    //
    //     sprite.x = x;
    //     sprite.y = y;
    //
    //     if (options.width !== undefined) {
    //         sprite.width = options.width
    //     }
    //
    //     if (options.height !== undefined) {
    //         sprite.height = options.height
    //     }
    //
    //     if (options.visible === false) {
    //         sprite.renderable = false;
    //     }
    //
    //     if (options.ySorting) {
    //         sprite.zIndex = zLayers.GAME_OBJECTS_MIN + y;
    //     }
    //
    //     this.setSprite(entityId, sprite);
    //
    //     return sprite;
    // };
    //
    // removeSprite(id: string) {
    //     const sprite = this.getSprite(id);
    //     if (sprite) {
    //         sprite.destroy();
    //         delete this.spriteMap[id];
    //     } else {
    //         console.warn('cant remove sprite that doesnt exist:', id);
    //     }
    // }
    //
    // destroyContainer(id: string) {
    //     const cont = this.getContainer(id);
    //     if (cont) {
    //         cont.destroy();
    //         delete this.containersMap[id];
    //     } else {
    //         console.warn('cant remove container that doesnt exist:', id);
    //     }
    // }
    //
    // destroyAnimation(id: string) {
    //     const animations = this.getAllAnimations(id);
    //     if (animations && animations.length) {
    //         this.containersMap[id].destroy({children: true});
    //         delete this.containersMap[id];
    //         delete this.animationsMap[id];
    //         return;
    //     }
    // }
    //
    // createRectangle(options: RectangleOptions) {
    //     const graphics = new PIXI.Graphics();
    //
    //     if (options.fill) {
    //         graphics.beginFill(options.fill, options.alpha);
    //     } else {
    //         graphics.beginFill(colorsNum.WHITE, 0);
    //     }
    //
    //     graphics.lineStyle(options.lineWidth || 1, options.lineColor, 1)
    //
    //     graphics.drawRect(options.x, options.y, options.width, options.height);
    //
    //     if (options.fill) graphics.endFill();
    //
    //     (options.parent || this.pixiApp.stage).addChild(graphics);
    //
    //     return graphics;
    // }
    //
    // getIsHovered(obj: PIXI.Container) {
    //     const pos = this.interactionManager.mouse.global
    //     return obj.getBounds().contains(pos.x, pos.y);
    // }
}

interface RectangleOptions {
    x: number,
    y: number,
    width: number,
    height: number,
    parent?: Container,
    fill?: number,
    alpha?: number,
    stroke?: number,
    lineWidth?: number,
    lineColor?: number
}

interface AnimationOptions {
    entityId: string
    path: string
    animationSpeed: number
    currentAnimation: string
    autoplay?: boolean
    x: number
    y: number
    anchor?: Vec
    ySorting?: boolean
    onEnd?: () => void
}

interface AnimationsMap {
    [propName: string]: {
        [propName: string]: any
    }
}

const animationDefaultOptions = {
    x: 0,
    y: 0,
    anchor: {x: 0, y: 0},
};

interface TileOptions {
    paths: string[]
    width: number
    height: number
    entityId: string
    x?: number
    y?: number
    container?: Container
    cacheAsBitmap?: boolean
}
const tileDefaultOptions = {
    x: 0,
    y: 0,
    cacheAsBitmap: true,
};

interface SpriteOptions {
    entityId: string
    path: string
    x: number
    y: number
    anchor?: Vec
    container?: Container
    visible?: boolean
    ySorting?: boolean,
    width?: number,
    height?: number,
}
const spriteDefaultOptions = {
    x: 0,
    y: 0,
};

export const render = new RenderManager();