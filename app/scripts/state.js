var state = {
  timestamp : new Date(2000, 0, 0, 0, 0, 0, 0),
  inventory : ['Flashlight'],
  location : 'start_room'
}

function in_inventory(item) {
  if (state.inventory.indexOf(item)!=-1) {
    return true;
  }
  return false;
}

function in_location(item) {
  var location = locations[state.location];
  if (location.things.indexOf(item) != -1) { 
    return true;
  }
  return false;
}