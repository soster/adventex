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