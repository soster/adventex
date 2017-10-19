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

function find_event(location, item, action) {
  console.log(state.events);

  for (var property in state.events) {
    if (state.events.hasOwnProperty(property)) {
      var event = state.events[property];
      if (check_event_prereq(event.prereq_location, location)
        && check_event_prereq(event.prereq_action, action)
        && check_event_prereq(event.prereq_item, item)
        && check_event_prereq_inventory(event.prereq_inventory)) {
          return event;
        }
    }
  }

  return undefined;
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