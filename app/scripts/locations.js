/**
 * Definition of locations.
 * Immutable!
 * 
 */
const locations = {
  dungeon_cell : {
    name : 'Dungeon cell',
    description : 'Your dungeon cell. It is moist and dark, but a weak light shines through a small barred window just below the ceiling.\n'+
    'Because of the light you see the outlines of the few things in your cell. The door seems very massive and locked.\nDirty, half rotten straw is lying on the floor.\n',
    things : ['straw','bucket','bed','barred_window','trap_door'],
    persons : [],
    color : 'steelblue',
    connections : {
    }
  },

  corridor : {
    name : 'A small corridor',
    description : 'A small corridor. It stretches forward and backward. There is a burning torch on the wall, it flickers and casts creepy shadows.',
    things : ['good_torch'],
    persons : [],
    color : 'tan',
    connections : {
      up : 'dungeon_cell',
      forward: 'forward_corridor',
      backward: 'backward_corridor'
    }
  },
  forward_corridor : {
    name : 'A small corridor',
    description : 'A small corridor. It stretches backward. It ends in a solid wall.',
    things : [],
    persons : [],
    color : 'tan',
    connections : {
      backward: 'corridor'
    }
  },

  backward_corridor : {
    name : 'A small corridor',
    description : 'A small corridor. It stretches forward. It ends in a solid wall.',
    things : [],
    persons : [],
    color : 'tan',
    connections : {
      forward: 'corridor'
    }
  }


}

