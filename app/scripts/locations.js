/**
 * Definition of locations.
 * Immutable!
 * 
 */
const locations = {
  dungeon_cell : {
    name : 'Dungeon cell',
    description : 'Your dungeon cell. It is moist and dark, but a weak light shines through a small barred window just below the ceiling.\n\n'+
    'Because of the light you see the outlines of the few things in your cell. The door seems very massive and locked.\n\nDirty, half rotten straw is lying on the floor.',
    things : ['straw','bucket','bed','barred_window','trap_door'],
    persons : [],
    color : 'steelblue',
    connections : {
    }
  },

  corridor : {
    name : 'A narrow corridor',
    description : 'A narrow corridor. It stretches forward and backward. There is a burning torch on a mount on the wall, it flickers and casts creepy shadows.\n\n'+
    'The hole to your cell is too high for you to climb back.\n\n'+
    'You hear a faint noise from behind!',
    things : ['torch'],
    persons : [],
    color : 'tan',
    connections : {
      forward: 'forward_corridor',
      backward: 'backward_corridor'
    }
  },
  forward_corridor : {
    name : 'A narrow corridor',
    description : 'A narrow corridor. It stretches backward. It ends forward with a solid wall with a big scorch mark.',
    things : ['scorchmarks'],
    persons : [],
    color : 'tan',
    connections : {
      backward: 'corridor'
    }
  },

  backward_corridor : {
    name : 'A narrow corridor',
    description : 'A narrow corridor. It stretches forward. It ends backward with a solid granite wall.',
    things : [],
    persons : ['guard'],
    color : 'tan',
    connections : {
      forward: 'corridor'
    }
  }


}

