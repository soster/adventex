'use strict';
var advntx = (function (my) {
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
    find_item_ids_for_names_in_location: function (objects, location) {
      var retItemIds = [];
      if (objects===undefined || location===undefined || location.objects===undefined)
        return retItemIds;

      for (var i=0;i<objects.length;i++) {
        var object = objects[i];
        var itemIds = advntx.inventoryhandler.find_item_ids_for_name_anywhere(object);
        for (var i2=0;i2<itemIds.length;i2++) {
          var itemId = itemIds[i2];
          var index = location.objects.indexOf(itemId);
          if (index!=-1 && retItemIds.indexOf(itemId)==-1) {
            retItemIds.push(location.objects[index]);
          }
        }

      }
      return retItemIds;
    },

    set_location: function (location_id) {
      advntx.state.location = location_id;
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
}(advntx || {}));