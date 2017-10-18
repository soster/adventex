/**
 * Place all functions here which manipulate the state object.
 */

function remove_item_from_location(location, item) {
    var place = state.locations[location];
    if (place !== undefined) {
      var loc = place.things.indexOf(item);
      if (loc != -1) {
        place.things.splice(loc, 1 );
      }
    }
  }

function find_event(location, item, action) {
  console.log(state.events);
  jQuery.each(state.events, function(i, val) {
    var event = val;
    console.log('ev '+event.name);
    if (event.prereq_location==''||event.prereq_location==location) {
      if (event.prereq_action==''||event.prereq_action==action) {
        if (event.prereq_item==''||event.prereq_item==item) {
          if (event.prereq_in_inventory=''||in_inventory(event.prereq_in_inventory)) {
            return event;
          }
        }
      }
    }
  });
  return undefined;
}