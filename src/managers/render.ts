import * as PIXI from "pixi.js";
import {
    ceilTo,
    getDistanceBetween,
    getNormalizedVector,
    getRndItem,
    getVector,
    getVectorLength,
    Vec
} from "../utils/utils-math";
import {zLayers} from "../constants";
import {createId, getGameSize} from "../utils/utils-misc";
import {resoursePaths} from "../resourse-paths";

class RenderManager {
    pixiApp = new PIXI.Application({
        ...getGameSize()
    })

    animationsMap = {} as AnimationsMap
    spriteMap = {} as {[propName: string]: PIXI.Sprite}
    tilesMap = {} as {[propName: string]: PIXI.Container}
    containersMap = {} as {[propName: string]: PIXI.Container}

    init(update: (dt: number) => void) {
        this.pixiApp.stage.sortableChildren = true;

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // @ts-ignore
        window.pixiApp = this.pixiApp;

        document.body.appendChild(this.pixiApp.view);

        const resize = () => {};
        window.addEventListener('resize', resize);

        const ticker = PIXI.Ticker.shared;
        ticker.add(update);
    }

    getTexture(path: string) {
        return PIXI.Loader.shared.resources[path].texture;
    }

    getSpritesheet(path: string) {
        return PIXI.Loader.shared.resources[path].spritesheet;
    }

    createAnimation(options: AnimationOptions) {
        options = {...animationDefaultOptions, ...options};
        const {entityId, x, y, path, animationSpeed, anchor, currentAnimation, autoplay, onEnd} = options;

        const sheet = this.getSpritesheet(path);
        const map: {[key: string]: PIXI.AnimatedSprite} = {};

        const container = this.createContainer(entityId);
        container.x = x;
        container.y = y;

        if (!sheet) {
            throw Error('wrong spritesheet ' + path);
        }

        Object.keys(sheet.animations).forEach(animationKey => {
            const animatedSprite: PIXI.AnimatedSprite = new PIXI.AnimatedSprite(sheet.animations[animationKey]);

            animatedSprite.animationSpeed = animationSpeed;
            animatedSprite.renderable = animationKey === currentAnimation;

            if (anchor) {
                animatedSprite.anchor.set(anchor.x, anchor.y);
            }

            if (options.ySorting) {
                animatedSprite.zIndex = zLayers.GAME_OBJECTS_MIN + Math.round(y);
            }

            if (animationKey === currentAnimation && autoplay) {
                animatedSprite.play();
                if (onEnd) {
                    animatedSprite.loop = false;
                    animatedSprite.onComplete = onEnd;
                }
            }

            map[animationKey] = animatedSprite;
            container.addChild(animatedSprite);
        });

        this.setAnimations(entityId, map);

        return map;
    }

    changeAnimation(
        options:
        {entityId: string, animationName: string, time?: number, onLoop?: () => void}
    ) {
        const oldAnimation = this.getCurrentAnimation(options.entityId);
        const newAnimation = this.getAnimation(options.entityId, options.animationName);

        if (oldAnimation === newAnimation) return;

        if (oldAnimation) {
            oldAnimation.onLoop = undefined;
            oldAnimation.gotoAndStop(0);
            oldAnimation.renderable = false;
            oldAnimation.interactive = false;

            newAnimation.scale.x = oldAnimation.scale.x;
            newAnimation.scale.y = oldAnimation.scale.y;
            newAnimation.interactive = oldAnimation.interactive;
        }

        newAnimation.gotoAndPlay(0);
        newAnimation.renderable = true;

        if (options.time !== undefined) {
            const oneFrameDuration = (1000 / 60);
            const oneFrameDurationShouldBe = (options.time / newAnimation.textures.length);
            newAnimation.animationSpeed = ceilTo(oneFrameDuration / oneFrameDurationShouldBe, 2);
        }

        if (options.onLoop) {
            newAnimation.onLoop = options.onLoop;
        }
    }

    hideAnimation(entityId: string) {
        const anim = this.getCurrentAnimation(entityId);
        if (anim) anim.renderable = false;
    }

    changeSpriteVisibility(entityId: string, val: boolean) {
        this.getSprite(entityId).renderable = val;
    }

    changeContainerVisibility(entityId: string, val: boolean) {
        this.getContainer(entityId).renderable = val;
    }

    moveTowards(entityId: string, x: number, y: number, byDistance: number, ySorting = false, directToTarget = false): number {
        const obj = this.getContainer(entityId);
        const target = {x, y};

        const vec = getVector(obj, target)
        const oldDistance = getVectorLength(vec);
        const normalizedVec = getNormalizedVector(vec);

        const xShift = normalizedVec.x * byDistance;
        const yShift = normalizedVec.y * byDistance;

        if (Math.abs(vec.x) < Math.abs(xShift)) obj.x = target.x;
        else  obj.x += xShift

        if (Math.abs(vec.y) < yShift) obj.y = target.y;
        else  obj.y += yShift

        if (ySorting) {
            obj.zIndex = zLayers.GAME_OBJECTS_MIN + Math.round(y);
        }

        if (directToTarget) this.directToTarget(entityId, target)

        return getDistanceBetween(obj, target);
    }

    setInteractive(containerId: string, val: boolean){
        const c = this.getContainer(containerId);
        c.buttonMode = val;
        c.interactive = val;
    }

    moveSprite(entityId: string, x: number, y: number) {
        const container = this.getSprite(entityId);

        container.x = x;
        container.y = y;
    }

    move(entityId: string, x: number, y: number, ySorting = false) {
        const container = this.getContainer(entityId);

        container.x = x;
        container.y = y;

        if (ySorting) {
            container.zIndex = zLayers.GAME_OBJECTS_MIN + Math.round(y);
        }
    }

    directToTarget(id: string, target: Vec) {
        const obj = this.getContainer(id);
        if (!obj) throw Error('no container with id ' + id);

        obj.scale.x = Math.sign(target.x - obj.x);
    }

    createContainer(entityId: string, parentId?: string): PIXI.Container {
        const container = new PIXI.Container();

        let parent = this.pixiApp.stage;
        if (parentId) {
            parent = this.getContainer(parentId);
        }

        parent.addChild(container);
        this.setContainer(entityId, container);
        return container;
    }

    getContainer(entityId: string): PIXI.Container {
        return this.containersMap[entityId];
    };

    getSprite(entityId: string) {
        return this.spriteMap[entityId]
    }

    getAllAnimations(entityId: string): PIXI.AnimatedSprite[] {
        return Object.values(this.animationsMap[entityId])
    }

    getCurrentAnimation(entityId: string) : PIXI.AnimatedSprite | null {
        const animName = Object.keys(this.animationsMap[entityId]).find(aName => {
            return this.animationsMap[entityId][aName].renderable
        })
        return animName ? this.animationsMap[entityId][animName] : null;
    }

    getAnimation(entityId: string, animationName: string): PIXI.AnimatedSprite {
        return this.animationsMap[entityId][animationName];
    }

    setSprite(entityId: string, sprite: PIXI.Sprite) {
        this.spriteMap[entityId] = sprite;
    }

    setAnimations(entityId: string, animations: {[propName: string]: PIXI.AnimatedSprite}) {
        this.animationsMap[entityId] = animations;
    }

    setTiles(entityId: string, tiles: PIXI.Container) {
        this.tilesMap[entityId] = tiles;
    };

    setContainer(entityId: string, container: PIXI.Container) {
        if (this.containersMap[entityId]) {
            console.warn(`container with id ${entityId} already exists`);
        }

        this.containersMap[entityId] = container;
    };

    createTiles(options: TileOptions) {
        options = {...tileDefaultOptions, ...options};
        const {width, height, paths, container, cacheAsBitmap, x, y, entityId} = options;
        const texture = this.getTexture(paths[0]);
        if (!texture) throw Error('no such texture: ' + paths[0])
        const TILE_WIDTH = texture.width;
        const TILE_HEIGHT = texture.height;

        const tiles = new PIXI.Container();
        tiles.position.set(x, y);

        for (let col = 0; col < Math.ceil(width / TILE_WIDTH); col++) {
            for (let row = 0; row < Math.ceil(height / TILE_HEIGHT); row++) {
                this.createSprite({
                    entityId: createId(entityId+'_tile'),
                    path: getRndItem(paths),
                    x: col * TILE_WIDTH,
                    y: row * TILE_HEIGHT,
                    container: tiles,
                    anchor: {x: 0, y: 0}
                });
            }
        }

        (container || this.pixiApp.stage).addChild(tiles);

        if (cacheAsBitmap) {
            tiles.cacheAsBitmap = true;
        }

        return tiles;
    };

    createText(id: string, text: string, x: number, y: number, style?: any, parentId?: string) {
        const pixiText = new PIXI.Text(text, style || {});
        pixiText.x = x;
        pixiText.y = y;
        let parent = parentId ? this.getContainer(parentId) : this.pixiApp.stage;
        parent.addChild(pixiText);
        return pixiText;
    }

    createSprite(options: SpriteOptions) {
        options = {...spriteDefaultOptions, ...options};
        const {container, path, x, y, anchor, entityId} = options;
        let texture = this.getTexture(path);
        if (!texture) {
            throw Error('no texture for ' + path);
        }
        const sprite = new PIXI.Sprite(texture);
        (container || this.pixiApp.stage).addChild(sprite);

        if (anchor) {
            sprite.anchor.set(anchor.x, anchor.y)
        }

        sprite.x = x;
        sprite.y = y;

        if (options.width !== undefined) {
            sprite.width = options.width
        }

        if (options.height !== undefined) {
            sprite.height = options.height
        }

        if (options.visible === false) {
            sprite.renderable = false;
        }

        if (options.ySorting) {
            sprite.zIndex = zLayers.GAME_OBJECTS_MIN + y;
        }

        this.setSprite(entityId, sprite);

        return sprite;
    };

    removeSprite(id: string) {
        const sprite = this.getSprite(id);
        if (sprite) {
            sprite.destroy();
            delete this.spriteMap[id];
        } else {
            console.warn('cant remove sprite that doesnt exist:', id);
        }
    }

    destroyContainer(id: string) {
        const cont = this.getContainer(id);
        if (cont) {
            cont.destroy();
            delete this.containersMap[id];
        } else {
            console.warn('cant remove container that doesnt exist:', id);
        }
    }

    destroyAnimation(id: string) {
        const animations = this.getAllAnimations(id);
        if (animations && animations.length) {
            this.containersMap[id].destroy({children: true});
            delete this.containersMap[id];
            delete this.animationsMap[id];
            return;
        }
    }
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
        [propName: string]: PIXI.AnimatedSprite
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
    container?: PIXI.Container
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
    container?: PIXI.Container
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