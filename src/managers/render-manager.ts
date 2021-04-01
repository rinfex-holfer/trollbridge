import * as PIXI from "pixi.js";
import {getRndItem, Vec} from "../utils/utils-math";
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

    init() {
        this.pixiApp.stage.sortableChildren = true;

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        // @ts-ignore
        window.pixiApp = this.pixiApp;

        document.body.appendChild(this.pixiApp.view);

        const resize = () => {};
        window.addEventListener('resize', resize);

        const ticker = PIXI.Ticker.shared;
        const update = () => {};
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

        return map;
    }

    createContainer(entityId: string): PIXI.Container {
        const container = new PIXI.Container();
        this.pixiApp.stage.addChild(container);
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

        // const animations = getAllAnimations(id);
        // if (animations && animations.length) {
        //     containersMap[id].destroy({children: true});
        //     delete containersMap[id];
        //     delete animationsMap[id];
        //     return;
        // }
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
}
const spriteDefaultOptions = {
    x: 0,
    y: 0,
};

export const renderManager = new RenderManager();