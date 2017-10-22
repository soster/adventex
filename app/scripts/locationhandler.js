var locationhandler = {
    remove_item_from_location : function(location, item) {
        var place = state.locations[location];
        if (place !== undefined) {
          var loc = place.things.indexOf(item);
          if (loc != -1) {
            place.things.splice(loc, 1);
          }
        }
      },

    in_location : function(itemOrPerson) {
        var olocation = state.locations[state.location];
        if (olocation.things.indexOf(itemOrPerson.toLowerCase()) != -1) {
          return true;
        }
        if (olocation.persons.indexOf(itemOrPerson.toLowerCase()) != -1) {
            return true;
        }
        return false;

      },

      find_item_id_for_name : function (name) {
        var loc = state.locations[state.location];
        for (var i=0;i<loc.things.length;i++) {
          item_id = loc.things[i];
          var item = state.things[item_id];
          if (item.name.endsWith(name)) {
            return item_id;
          }
        }
      },

      set_location : function(location) {
        state.location = location;
      }
}