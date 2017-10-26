'use strict';
var advntx = (function (my) {
  my.locationhandler = {
    remove_item_from_location: function (location, item) {
      var place = advntx.state.locations[location];
      if (place !== undefined) {
        var loc = place.things.indexOf(item);
        if (loc != -1) {
          place.things.splice(loc, 1);
        }
      }
    },

    add_item_to_location: function (location, item) {
      var place = advntx.state.locations[location];
      place.things.push(item);
    },

    in_location: function (itemOrPerson) {
      var olocation = advntx.state.locations[advntx.state.location];
      if (olocation.things.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      if (olocation.persons.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      return false;

    },

    find_item_id_for_names: function (name, first_misc) {
      var loc = advntx.state.locations[advntx.state.location];
      for (var i = 0; i < loc.things.length; i++) {
        var item_id = loc.things[i];
        var item = advntx.state.things[item_id];
        if (item.name.endsWith(name)) {
          if (isEmpty(first_misc)) {
            return item_id;
          } else {
            if (item.name.includes(first_misc)) {
              return item_id;
            }
          }
        }
      }
      return '';
    },

    set_location: function (location) {
      advntx.state.location = location;
    },

    get_location_description: function (location_id) {
      var loc = advntx.state.locations[location_id];
      var description = loc.description;
      if (!isEmpty(loc.additional_description)) {
        description += '\n\n';
        description += loc.additional_description;
      }
      return description += '\n';
    },

    get_location_by_id: function (location_id) {
      return advntx.state.locations[location_id];
    }
  }
  return my;
}(advntx || {}));