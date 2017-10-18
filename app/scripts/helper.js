

function get_description(objects, name) {
    var obj = objects[name];
    if (obj === undefined) {
        return '';
    }
    var description = obj.description;
    if (description !== undefined)
        return description;
    return '';
}

function remove_item_from_location(location, item) {
    var place = locations[location];
    if (place !== undefined) {
      var loc = place.things.indexOf(item);
      if (loc != -1) {
        place.things.splice(loc, 1 );
      }
    }
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

  function is_portable(item) {
    if (state.things[item] === undefined) {
        return false;
    }
    return state.things[item].portable;
}