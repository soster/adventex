/**
 * Definition of things (objects, immobile and portable).
 */
'use strict';
const things = {
    straw: {
        name: 'straw',
        description: 'The straw is dirty, rotten and full with vermin. But underneath you see a trap door in the floor!',
        portable: false,
        error_portable: 'While touching the rotten straw you feel an iron ring which belongs to a hidden trap door!\n'+
        'But it makes no sense to fill your pockets with the straw, so you leave it where it is.',
        hidden: false,
        definite_article: 'the',
        indefinite_article: 'some'
    },

    bucket: {
        name: 'wooden bucket',
        description: 'A wooden bucket. It appears to be used for... well you can imagine. No other facilities here.',
        portable: false,
        error_portable: 'Trust me, you DON\'T want to carry THAT around! It is nearly full with... you know.',
        hidden: false,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    bed: {
        name: 'bunk bed',
        description: 'Your bunk bed. Comfortable as a wooden board. Maybe due to the fact that it IS a wooden board.\nIt is mounted on the wall.',
        portable: false,
        hidden: false,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    trap_door: {
        name: 'trap door',
        description: 'After removing the straw, you can see a trap door in the floor.',
        portable: false,
        hidden: true,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    cell_door: {
        name: 'cell door',
        description: 'Very sturdy and locked.',
        portable: false,
        hidden: false,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    barred_window: {
        name: 'barred window',
        description: 'It is to high for you, you can\'t reach it!',
        portable: false,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    torch: {
        name: 'burning torch',
        description: 'The torch is quite bright!',
        portable: true,
        definite_article: 'the',
        indefinite_article: 'a'
    },

    scorchmarks: {
        name: 'scorch marks',
        description: 'A fire left large, frightening scorchmarks. Bigger than expected if created by a torch.',
        portable: false,
        definite_article: 'the',
        indefinite_article: 'some'
    }

};






