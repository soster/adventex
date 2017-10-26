'use strict';
var advntx = (function (my) {
  my.eventhandler = {
    check_event_prereq: function (prereq, to_check) {
      if (isEmpty(prereq) || prereq == to_check) {
        return true;
      }
      return false;
    },

    check_event_prereq_inventory: function (prereq) {
      if (isEmpty(prereq)) {
        return true;
      }

      return advntx.inventoryhandler.in_inventory(prereq);
    },

    find_event: function (location, first_misc, second_misc, first_item, second_item, action, preposition) {
      for (var property in advntx.state.events) {
        if (advntx.state.events.hasOwnProperty(property) && property != 'start_event') {
          var event = advntx.state.events[property];
          if (!isEmpty(event.prereq_action) && !isEmpty(action)) {
            if (advntx.check_synonyms(event.prereq_action, action)) {
              action = event.prereq_action;
            }
          }
          if (this.check_event_prereq(event.prereq_location, location)
            && this.check_event_prereq(event.prereq_action, action)
            && this.check_event_prereq(event.prereq_first_misc, first_misc)
            && this.check_event_prereq(event.prereq_preposition, preposition)
            && this.check_event_prereq(event.prereq_second_misc, second_misc)
            && this.check_event_prereq(event.prereq_first_item, first_item)
            && this.check_event_prereq(event.prereq_second_item, second_item)
            && this.check_event_prereq_inventory(event.prereq_inventory)) {
            return event;
          }
        }
      }

      return undefined;
    },

    execute_event: function (event) {
      if (!isEmpty(event.action_add_item) && isEmpty(event.action_add_item_location)) {
        // into the inventory
        advntx.inventoryhandler.add_to_inventory(event.action_add_item);
      } else if (!isEmpty(event.action_add_item) && !isEmpty(event.action_add_item_location)) {
        // into a location
        var location = advntx.state.locations[event.action_add_item_location];
        location.things.push(event.action_add_item);
      }
      if (!isEmpty(event.action_new_connection)) {
        var place = advntx.state.locations[advntx.state.location];
        place.connections[event.action_new_connection] = event.action_new_connection_location;
      }

      if (!isEmpty(event.action_move_to_location)) {
        advntx.locationhandler.set_location(event.action_move_to_location);
      }
      if (!isEmpty(event.action_new_location_description)) {
        var place = advntx.state.locations[advntx.state.location];
        place['additional_description'] = event.action_new_location_description;
      }

    }

  }
  return my;
}(advntx || {}));