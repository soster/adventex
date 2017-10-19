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