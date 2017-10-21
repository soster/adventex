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
    things : ['tapestry','vase', 'floor', 'east_door'],
    persons : [],
    color : 'cornsilk',
    connections : {
      south : 'balkony',
      west : 'west_room'
    }
  },

  balkony : {
    name : 'Balkony',
    description : 'This is the balkony of the hall. It faces south, to an empty place with a statue in the middle.',
    things : ['floor'],
    persons : ['moleman'],
    color : 'coral',
    connections : {
      north : 'start_room'
    }
  },
  west_room : {
    name : 'West room',
    description : 'This is a much smaller room than the main hall with two small windows to the west.',
    things : ['floor', 'troll'],
    persons : [],
    color : 'aquamarine',
    connections : {
      east : 'start_room'
    }
  },

  room_behind_door : {
    name : 'Room behind door',
    description : 'A small room behind the door with the large knob.',
    things : [],
    persons : [],
    color : 'green',
    connections : {
      west : 'start_room'
    }
  },

  dungeon : {
    name : 'Dungeon',
    description : 'A dark and humid dungeon. There is a hole in the ceiling. Maybe it is possible to climb up?',
    things : [],
    persons : [],
    color : 'blue',
    connections : {
      up : 'start_room'
    }
  }

}

