var locations = {
  start_room : {
    description : 'You are in a large, impressive hall.\n' +
    'You see a corridor to the west and a large hallway leading to the south.',
    color : 'cornsilk',
    connections : {
      south : 'south_room',
      west : 'west_room'
    }
  },

  south_room : {
    description : 'This is the room to the south.',
    color : 'coral',
    connections : {
      north : 'start'
    }
  },
  west_room : {
    description : 'This is the room to the west.',
    color : 'aquamarine',
    connections : {
      east : 'start'
    }
  }

}