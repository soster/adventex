'use strict';
export default function locationhandler(my) {
  var advntx = my;
  my.locationhandler = {
    remove_item_from_location: function (location, item) {
      var place = advntx.state.locations[location];
      if (place !== undefined) {
        var loc = place.objects.indexOf(item);
        if (loc != -1) {
          place.objects.splice(loc, 1);
        }
      }
    },

    add_item_to_location: function (location, item) {
      var place = advntx.state.locations[location];
      place.objects.push(item);
    },

    in_location: function (itemOrPerson) {
      var olocation = advntx.state.locations[advntx.state.location];
      if (olocation.objects.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      if (olocation.persons.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      return false;

    },

    //FIXME
    find_item_ids_in_location: function (names, location) {
      if (location==undefined) {
        return [];
      }
      return advntx.find_item_ids(names, location.objects, advntx.state.objects);
    },

    set_location: function (location_id) {
      advntx.state.location = location_id;
    },

    get_location_description: function (location_id) {
      var loc = advntx.state.locations[location_id];
      var description = my.get_description(advntx.state.locations, location_id);
      return description += '\n';
    },

    get_location_by_id: function (location_id) {
      return advntx.state.locations[location_id];
    },

    find_connection_for_direction: function(location, direction) {
      var state = location.state;
      if (!isEmpty(state)&&location.states!=undefined) {
        var stateObj = location.states[state];
        if (stateObj!=undefined && stateObj.connections!=undefined) {
          return stateObj.connections[direction];
        }
      }
      if (location.connections[direction] !== undefined) {
        return (location.connections[direction]);
      }
      return undefined;
    },

    visited: function(location_id) {
      var loc = this.get_location_by_id(location_id);
      if (loc.visited===undefined||loc.visited==false) {
        loc.visited = true;
        return false;
      }
      return true;
    }
  }
  return my;
}