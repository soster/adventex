/**
 * Definition of locations.
 * Immutable!
 * 
 */
'use strict';
const locations = {
  dungeon_cell: {
    name: 'Dungeon cell',
    description: 'A dungeon cell. It is moist and dark, but a weak light shines through a small barred window just below the ceiling.\n\n' +
    'Because of the light you see the outlines of the few things in your cell. The door seems very massive and is locked.\n\nDirty, half rotten straw is lying on the floor.',
    things: ['straw', 'bucket', 'bed', 'barred_window', 'cell_door', 'trap_door' ],
    persons: [],
    color: 'steelblue',
    connections: {
    }
  },

  corridor: {
    name: 'A narrow corridor',
    description: 'A narrow corridor. It stretches to the east and to the west, slightly curved.\n\n' +
    'The hole in the ceiling with the trap door is too high for you to climb back.\n\n' +
    'You hear a faint noise from the west!',
    additional_description: 'There is a burning torch on a mount on the wall, it flickers and casts creepy shadows.',
    things: ['torch'],
    persons: [],
    color: 'tan',
    connections: {
      east: 'forward_corridor',
      west: 'backward_corridor'
    }
  },
  forward_corridor: {
    name: 'A narrow corridor',
    description: 'A narrow corridor. It stretches further to the east, slightly curved. There is a big scorch mark on the inner wall.',
    things: ['scorchmarks'],
    persons: [],
    color: 'tan',
    connections: {
      west: 'corridor',
      east: 'entrance_corridor'
    }
  },

  backward_corridor: {
    name: 'A narrow corridor',
    description: 'A narrow corridor. It stretches further to the west, slightly curved.',
    things: [],
    persons: ['guard'],
    color: 'tan',
    connections: {
      east: 'corridor',
      west: 'entrance_corridor'
    }
  },

  entrance_corridor: {
    name: 'Entrance hall',
    description: 'An entrance hall. It stretches to the east and west, slightly curved. There is a big portal to the south.',
    things: [],
    persons: [],
    color: 'white',
    connections: {
      east: 'forward_corridor',
      west: 'backward_corridor',
      south: ''
      
    }
  }


};

