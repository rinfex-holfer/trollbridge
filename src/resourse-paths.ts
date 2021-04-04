const imagesUrl = `./assets/img`;
const atlasesUrl = `./assets/img/atlases`;
const audioUrl = `./assets/audio`;

export enum CursorType {
    DEFAULT = 'DEFAULT',
}

export const resoursePaths = {
    images: {
        cursor_default: `${imagesUrl}/cursor_default.png`,
        floor: `${imagesUrl}/floor.png`,
        grass: `${imagesUrl}/tile_grass.png`,
        meat: `${imagesUrl}/meat.png`,
        bones: `${imagesUrl}/bones.png`,
        button_release: `${imagesUrl}/leg.png`,
        button_rob: `${imagesUrl}/throwRock.png`,
        button_imprison: `${imagesUrl}/prisoner.png`,
        button_kill: `${imagesUrl}/strike.png`,
        button_devour: `${imagesUrl}/devoure.png`,
        button_make_food: `${imagesUrl}/makeFood_0.png`,
        button_feed: `${imagesUrl}/makeFood.png`,
        empty_sprite: `${imagesUrl}/tile_empty.png`,
    },

    atlases: {
        troll: `${atlasesUrl}/troll.json`,
        peasant: `${atlasesUrl}/peasant.json`,
        militia: `${atlasesUrl}/pikeman.json`,
        soldier: `${atlasesUrl}/shieldman.json`,
        knight: `${atlasesUrl}/knight.json`,
        pot: `${atlasesUrl}/pot.json`,
    },

    sounds: {
        hit: `${audioUrl}/hit.wav`,
    },

    music: {
        gameplay_music: `${audioUrl}/gameplay_music.mp3`,
    }
};

const cursorImages = {
    [CursorType.DEFAULT]: resoursePaths.images.cursor_default,
}

export const getCursor = (type: CursorType) => {
    return `url('${cursorImages[type]}'),auto`;
}