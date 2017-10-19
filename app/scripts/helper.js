/**
 * Helper functions. They do not manipulate states.
 */

function get_description(objects, id) {
  return get_property(objects, 'description', id)
}


function get_name(objects, id) {
  return get_property(objects, 'name', id);
}


function get_property(objects, property, id) {
  id = id.toLowerCase();
  var obj = objects[id];
  if (obj === undefined) {
    return '';
  }
  var retVal = obj[property];
  if (retVal !== undefined)
    return retVal;
  return '';
}


function in_inventory(item) {
  if (state.inventory.indexOf(item.toLowerCase()) != -1) {
    return true;
  }
  return false;
}


function in_location(item) {
  var olocation = state.locations[state.location];
  if (olocation.things.indexOf(item.toLowerCase()) != -1) {
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

function get_first_of_type(words, type) {
  if (words[type].length > 0) {
    return words[type][0];
  }
  return '';
}


function find_first_match(words, type, objects) {
  for (var i=0;i<words[type].length;i++) {
    if (objects[words[type][i]]!== undefined) {
      return words[type][i];
    }
  }
  return '';
}


function find_event(location, item, action) {
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