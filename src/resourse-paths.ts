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
        rock: `${imagesUrl}/rock.png`,
        arrow: `${imagesUrl}/arrow.png`,
        bridge_crack: `${imagesUrl}/bridge_crack.png`,
        bed_upgraded: `${imagesUrl}/bed-upgraded.png`,
        drying_rack: `${imagesUrl}/drying_rack.png`,

        button_release: `${imagesUrl}/leg.png`,
        button_rob: `${imagesUrl}/icon_pay.png`,
        button_imprison: `${imagesUrl}/prisoner.png`,
        button_strike: `${imagesUrl}/icon_claws.png`,
        button_kill: `${imagesUrl}/icon_blood.png`,
        button_throw_rock: `${imagesUrl}/icon_rock.png`,
        button_throw_char: `${imagesUrl}/icon_throw_char.png`,
        button_devour: `${imagesUrl}/icon_devour.png`,
        button_make_food: `${imagesUrl}/makeFood_0.png`,
        button_feed: `${imagesUrl}/makeFood.png`,
        button_upgrade: `${imagesUrl}/upgrade.png`,

        status_change_dmg: `${imagesUrl}/icon_blood.png`,
        status_change_heal: `${imagesUrl}/icon_green_plus.png`,
        status_change_morale: `${imagesUrl}/icon_morale.png`,
        status_change_self_control: `${imagesUrl}/icon_self_control.png`,

        icon_shield: `${imagesUrl}/icon_shield.png`,
        icon_surrender: `${imagesUrl}/icon_surrender.png`,
        icon_rage: `${imagesUrl}/icon_rage.png`,

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

        tile_black: `${imagesUrl}/tile_black.png`,
    },

    atlases: {
        troll: `${atlasesUrl}/troll.json`,
        peasant: `${atlasesUrl}/peasant.json`,
        pikeman: `${atlasesUrl}/pikeman.json`,
        shieldman: `${atlasesUrl}/shieldman.json`,
        archer: `${atlasesUrl}/archer.json`,
        knight: `${atlasesUrl}/knight.json`,
        horse: `${atlasesUrl}/horse.json`,
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
        eating_0: `${audioUrl}/eating_0.mp3`,
        eating_1: `${audioUrl}/eating_1.mp3`,
        eating_2: `${audioUrl}/eating_2.mp3`,
        eating_3: `${audioUrl}/eating_3.mp3`,

        level_up: `${audioUrl}/level_up.mp3`,
        upgrade: `${audioUrl}/upgrade.mp3`,

        troll_breathing: `${audioUrl}/troll_breathing.mp3`,
        troll_breathing_slow: `${audioUrl}/troll_breathing_slow.mp3`,
        troll_death: `${audioUrl}/troll_death.mp3`,
        troll_wounded_0: `${audioUrl}/troll_wounded_0.mp3`,
        troll_wounded_1: `${audioUrl}/troll_wounded_1.mp3`,
        troll_wounded_2: `${audioUrl}/troll_wounded_2.mp3`,
        troll_block_0: `${audioUrl}/troll_block_0.mp3`,
        troll_block_1: `${audioUrl}/troll_block_1.mp3`,
        troll_block_2: `${audioUrl}/troll_block_2.mp3`,
        troll_laugh_0: `${audioUrl}/troll_laugh_0.mp3`,
        troll_laugh_hard: `${audioUrl}/troll_laugh_1.mp3`,
        troll_laugh_medium: `${audioUrl}/troll_laugh_2.mp3`,
        troll_hm: `${audioUrl}/troll_hm.mp3`,
        troll_hey: `${audioUrl}/troll_hey.mp3`,
        troll_oh: `${audioUrl}/troll_oh.mp3`,
        troll_attack_voice: `${audioUrl}/troll_attack_voice.mp3`,
    },

    music: {
        gameplay_music: `${audioUrl}/gameplay_music.mp3`,
        gameover: `${audioUrl}/music_game_over_0.mp3`,
        combat_started_0: `${audioUrl}/music_combat_started_0.mp3`,
        combat_started_1: `${audioUrl}/music_combat_started_1.mp3`,
        combat_won_0: `${audioUrl}/music_combat_won_0.mp3`,
        combat_won_1: `${audioUrl}/music_combat_won_1.mp3`,
        time_passed_0: `${audioUrl}/music_time_passed_0.mp3`,
        time_passed_1: `${audioUrl}/music_time_passed_1.mp3`,
        time_passed_2: `${audioUrl}/music_time_passed_2.mp3`,
    }
};

const cursorImages = {
    [CursorType.DEFAULT]: resoursePaths.images.cursor_default,
}

export const getCursor = (type: CursorType) => {
    return `url('${cursorImages[type]}'),auto`;
}