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
      return this.check_event_prereq_array(prereq, advntx.state.inventory);
    },

    check_event_prereq_array: function (prereq, to_check) {
      if (prereq===undefined || prereq == '') {
        return true;
      }

      if (to_check===undefined) {
        return false;
      }
      
      for (var i=0;i<prereq.length;i++) {
        if (to_check.indexOf(prereq[i])==-1) {
          return false;
        }
      }

      return true;
    },

    check_triggered_events: function(prereq_triggered_events,prereq_triggered_event_step_offset) {
      if (isEmpty(prereq_triggered_events)||prereq_triggered_events.length==0) {
        return true;
      }

      for (var i=0;i<prereq_triggered_events.length;i++) {
        var event = advntx.state.events[prereq_triggered_events[i]];
        if (event===undefined) {
          return true;
        }
        if (event.triggered===undefined || event.triggered == false) {
          return false;
        } else if (prereq_triggered_event_step_offset!=undefined && prereq_triggered_event_step_offset>0){
          if (advntx.state.steps-event.triggered_steps<prereq_triggered_event_step_offset) {
            return false;
          }
        }
      }
      return true;
    },

    check_visited_locations: function(prereq_visited_locations) {
      if (isEmpty(prereq_visited_locations)) {
        return true;
      }

      for (var i=0;i<prereq_visited_locations.length;i++) {
        var loc = advntx.state.locations[prereq_visited_locations[i]];
        if (loc.visited===undefined || loc.visited == false) {
          return false;
        }
      }
      return true;
    },

    check_trigger_once: function(event) {
      if (event.triggered===undefined||event.triggered==false||event.trigger_once === undefined) {
        return true;
      }

      if (event.triggered==true&&event.trigger_once==true) {
        return false;
      }
    },

    find_event: function (location, used_items, verb, preposition) {
      for (var property in advntx.state.events) {
        if (advntx.state.events.hasOwnProperty(property) && property != 'start_event') {
          var event = advntx.state.events[property];
          if (event.disabled!=undefined && event.disabled) {
            continue;
          }
          if (!isEmpty(event.prereq_verb) && !isEmpty(verb)) {
            if (advntx.check_synonyms(event.prereq_verb, verb)) {
              verb = event.prereq_verb;
            }
          }


          if (this.check_event_prereq(event.prereq_location, location)
            && this.check_event_prereq(event.prereq_verb, verb)
            && this.check_event_prereq(event.prereq_preposition, preposition)
            && this.check_event_prereq_array(event.prereq_used_items, used_items)
            && this.check_event_prereq_inventory(event.prereq_inventory_items)
            && this.check_triggered_events(event.prereq_triggered_events, event.prereq_triggered_event_step_offset)
            && this.check_visited_locations(event.prereq_visited_locations)
            && this.check_trigger_once(event)) {
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
      if (!isEmpty(event.action_disable_event)) {
        var nevent = advntx.state.events[event.action_disable_event];
        nevent.disabled = true;
      }

      if (!isEmpty(event.action_enable_event)) {
        var nevent = advntx.state.events[event.action_enable_event];
        if (nevent!= undefined) {
          nevent.disabled = false;
          nevent.triggered_steps = advntx.state.steps;
        }
        
      }

      event.triggered = true;
      event.triggered_steps = advntx.state.steps;

    }

  }
  return my;
}(advntx || {}));