/**
 * Place all functions here which manipulate the state object.
 */

function remove_item_from_location(location, item) {
  var place = state.locations[location];
  if (place !== undefined) {
    var loc = place.things.indexOf(item);
    if (loc != -1) {
      place.things.splice(loc, 1);
    }
  }
}

function check_event_prereq(prereq, to_check) {
  if (prereq === undefined || prereq == '' || prereq == to_check) {
    return true;
  }
  return false;
}

function check_event_prereq_inventory(prereq) {
  if (prereq === undefined || prereq == '') {
    return true;
  }

  return in_inventory(prereq);
}

function execute_event(event) {
  if (event.action_add_item != '' && event.action_add_item_location == '') {
    // into the inventory
    add_to_inventory(event.action_add_item);
  } else if (event.action_add_item != '' && event.action_add_item_location != '') {
    // into a location
    var location = state.locations[event.action_add_item_location];
    location.things.push(event.action_add_item);
  }
  if (event.action_new_connection != '') {
    var place = state.locations[state.location];
    place.connections[event.action_new_connection] = event.action_new_connection_location;
  }

  if (event.action_move_to_location != '') {
    set_location(event.action_move_to_location);
  }

}
