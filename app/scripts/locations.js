/**
 * Definition of locations.
 * Immutable!
 * 
 */
const locations = {
  start_room : {
    name : 'Start room',
    description : 'You are in the middle of a vast and clean, almost sterile hall.\n' +
    'The ceiling is so far away that it\'s almost invisible to your eyes.\n' +
    'There is a corridor to the west between two columns and another similar corridor to the south.',
    things : ['tapestry','vase', 'floor'],
    persons : [],
    color : 'cornsilk',
    connections : {
      south : 'south_room',
      west : 'west_room'
    }
  },

  south_room : {
    name : 'South room',
    description : 'This hall is slightly smaller than the main hall with a large window to the east.',
    things : ['floor'],
    persons : [],
    color : 'coral',
    connections : {
      north : 'start_room'
    }
  },
  west_room : {
    name : 'West room',
    description : 'This is a much smaller room than the main hall with two small windows to the west.',
    things : ['floor'],
    persons : [],
    color : 'aquamarine',
    connections : {
      east : 'start_room'
    }
  }

}

