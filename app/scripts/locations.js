/**
 * Definition of locations.
 * Immutable!
 * 
 */
const locations = {
  start_room : {
    name : 'Start room',
    description : 'You are in the middle of a vast and clean, almost sterile hall. The ceiling is so far away that it\'s almost invisible to your eyes.\n' +
    'There is a corridor to the west between two columns and another similar corridor to the south.',
    things : ['tapestry','vase'],
    persons : [],
    color : 'cornsilk',
    connections : {
      south : 'south_room',
      west : 'west_room'
    }
  },

  south_room : {
    name : 'South room',
    description : 'This hall is slightly smaller than the big hall.',
    things : ['marble floor'],
    persons : [],
    color : 'coral',
    connections : {
      north : 'start_room'
    }
  },
  west_room : {
    name : 'West room',
    description : 'This is the room to the west. It is a much smaller room than the big hall with two small windows.',
    things : ['marble floor'],
    persons : [],
    color : 'aquamarine',
    connections : {
      east : 'start_room'
    }
  }

}

