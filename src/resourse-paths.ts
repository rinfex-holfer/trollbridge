const imagesUrl = `./assets/img`;
const atlasesUrl = `./assets/img/atlases`;
const audioUrl = `./assets/audio`;

export enum CursorType {
    DEFAULT = 'DEFAULT',
}

export const resoursePaths = {
    images: {
        background: `${imagesUrl}/bg.png`,
        cursor_default: `${imagesUrl}/cursor_default.png`,
        floor: `${imagesUrl}/floor.png`,
        grass: `${imagesUrl}/tile_grass.png`,
        meat_raw: `${imagesUrl}/meat_raw.png`,
        meat_stale: `${imagesUrl}/meat_stale.png`,
        meat_dried: `${imagesUrl}/meat_dried.png`,
        meat_human_leg: `${imagesUrl}/meat_human_leg.png`,
        meat_human_hand: `${imagesUrl}/meat_human_hand.png`,
        dish: `${imagesUrl}/dish.png`,
        bones: `${imagesUrl}/bones.png`,
        bed: `${imagesUrl}/bed.png`,
        bed_upgraded: `${imagesUrl}/bed-upgraded.png`,
        drying_rack: `${imagesUrl}/drying_rack.png`,
        button_release: `${imagesUrl}/leg.png`,
        button_rob: `${imagesUrl}/throwRock.png`,
        button_imprison: `${imagesUrl}/prisoner.png`,
        button_kill: `${imagesUrl}/strike.png`,
        button_devour: `${imagesUrl}/devoure.png`,
        button_make_food: `${imagesUrl}/makeFood_0.png`,
        button_feed: `${imagesUrl}/makeFood.png`,
        button_upgrade: `${imagesUrl}/upgrade.png`,
        empty_sprite: `${imagesUrl}/tile_empty.png`,
        particle_hit: `${imagesUrl}/particle_hit.png`,
        particle_blood: `${imagesUrl}/particle_blood.jpg`,
        particle_smoke_green: `${imagesUrl}/particle_smoke_green.png`,
        treasury: `${imagesUrl}/treasury.png`,
        "gold-1": `${imagesUrl}/gold-1.png`,
        "gold-2": `${imagesUrl}/gold-2.png`,
        "gold-3": `${imagesUrl}/gold-3.png`,
        "gold-4-9": `${imagesUrl}/gold-4-9.png`,
        "gold-some": `${imagesUrl}/gold-some.png`,
        "gold-many": `${imagesUrl}/gold-many.png`,
        "gold-almost": `${imagesUrl}/gold-almost.png`,
        "gold-chest": `${imagesUrl}/gold-chest.png`,
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
        hitByTroll: `${audioUrl}/hit.wav`,
        block: `${audioUrl}/block.wav`,
        torn: `${audioUrl}/torn.wav`,
        pick: `${audioUrl}/pick_0.mp3`,
        pick_big: `${audioUrl}/pick_1.mp3`,
        pick_thin: `${audioUrl}/pick_2.mp3`,
        cancel: `${audioUrl}/cancel.mp3`,
        collect: `${audioUrl}/collect.mp3`,
        bonk: `${audioUrl}/toock.mp3`,
        bubble: `${audioUrl}/bubble.mp3`,
        chew: `${audioUrl}/chew.mp3`,
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