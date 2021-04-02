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
    },

    atlases: {
        troll: `${atlasesUrl}/troll.json`,
        peasant: `${atlasesUrl}/peasant.json`,
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