/**
 * Definition of things (objects, immobile and portable).
 */
'use strict';
const things = {
    straw: {
        name: 'straw',
        description: 'Moving the rotten, dirty straw reveals a trap door in the floor!',
        portable: false,
        error_portable: 'Anyway, it makes no sense to carry rotten straw around!',
        hidden: false
    },

    bucket: {
        name: 'wooden bucket',
        description: 'A wooden bucket. It appears to be used for... well you can imagine. No other facilities here.',
        portable: false,
        error_portable: 'Trust me, you DON\'T want to carry THAT around! It is nearly full with... you know.',
        hidden: false
    },

    bed: {
        name: 'bunk bed',
        description: 'Your bunk bed. Comfortable as a wooden board. Maybe due to the fact that it IS a wooden board.\nIt is mounted on the wall.',
        portable: false,
        hidden: false
    },

    trap_door: {
        name: 'trap door',
        description: 'After removing the straw, you can see a trap door in the floor.',
        portable: false,
        hidden: true
    },

    barred_window: {
        name: 'barred window',
        description: 'It is to high for you, you can\'t reach it!',
        portable: false
    },

    torch: {
        name: 'burning torch',
        description: 'The torch is quite bright!',
        portable: true
    },

    scorchmarks: {
        name: 'scorch marks',
        description: 'A fire left large, frightening scorchmarks. Bigger than expected if created by a torch.',
        portable: false
    }

};






