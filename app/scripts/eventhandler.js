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

    check_event_prereq_not_inventory: function (prereq) {
      return this.check_event_prereq_not_array(prereq, advntx.state.inventory);
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

    check_event_prereq_not_array: function (prereq, to_check) {
      if (prereq===undefined || prereq == '') {
        return true;
      }

      if (to_check===undefined) {
        return true;
      }
      
      for (var i=0;i<prereq.length;i++) {
        if (to_check.indexOf(prereq[i])!=-1) {
          return false;
        }
      }

      return true;
    },
    
    /** checks if the events in the list are already triggered AND enabled */
    check_triggered_events: function(prereq_triggered_events,prereq_triggered_event_step_offset) {
      if (isEmpty(prereq_triggered_events)) {
        return true;
      }

      for (var i=0;i<prereq_triggered_events.length;i++) {
        var event = advntx.state.events[prereq_triggered_events[i]];
        if (event===undefined) {
          return true;
        }
        if ((event.triggered===undefined || event.triggered == false) || (event.disabled != undefined && event.disabled == true)) {
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

    find_events: function (location, used_items, verb, preposition, events) {
      var retEvents = [];
      for (var property in events) {
        if (events.hasOwnProperty(property) && property != 'start_event') {
          var event = events[property];
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
            && this.check_event_prereq_not_inventory(event.prereq_not_inventory_items)
            && this.check_triggered_events(event.prereq_triggered_events, event.prereq_triggered_event_step_offset)
            && this.check_visited_locations(event.prereq_visited_locations)
            && this.check_trigger_once(event)) {
              retEvents.push(event);
          }
        }
      }

      return retEvents;
    },

    execute_event: function (event, echo) {
      if (!isEmpty(event.action_add_items)) {
        // into the inventory
        for (var i=0;i<event.action_add_items.length;i++) {
          var temp = event.action_add_items[i].split(":");
          if (temp.length==1) {//inventory
            advntx.inventoryhandler.add_to_inventory(temp[0]);
          } else if (temp.length==2) {//location
            var location;
            if (temp[0]=='location') {
              location = advntx.state.locations[advntx.state.location];
            } else {
              location = advntx.state.locations[temp[0]];
            }
            if (location.objects[temp[1]]===undefined) {
              location.objects.push(temp[1]);
            }
          }
        } 
      }

      if (!isEmpty(event.action_remove_items)) {
        // from the inventory
        for (var i=0;i<event.action_remove_items.length;i++) {
          var temp = event.action_remove_items[i].split(":");
          if (temp.length==1) {//inventory
            advntx.inventoryhandler.remove_from_inventory(temp[0]);
          } else if (temp.length==2) {
            var location;
            if (temp[0]=='location') {
              location = advntx.state.locations[advntx.state.location];
            } else {
              location = advntx.state.locations[temp[0]];
            }
            location.objects.remove(temp[1]);
          } 
        }
      }


      if (!isEmpty(event.action_new_connections)) {
        for (var i=0;i<event.action_new_connections.length;i++) {
          var temp = event.action_new_connections[i].split(":");
          var place = advntx.state.locations[temp[0]];
          var direction = temp[1];
          var to = temp[2];
          place.connections[direction] = to;
        }
      }

      if (!isEmpty(event.action_move_to_location)) {
        advntx.locationhandler.set_location(event.action_move_to_location);
      }
      if (event.action_new_location_description!=undefined) {
        var place = advntx.state.locations[advntx.state.location];
        place['additional_description'] = event.action_new_location_description;
      }
      if (!isEmpty(event.action_disable_events)) {
        for (var i=0;i<event.action_disable_events.length;i++) {
          var nevent = advntx.state.events[event.action_disable_events[i]];
          nevent.disabled = true;
        }

      }

      if (!isEmpty(event.action_enable_events)) {
        for (var i=0;i<event.action_enable_events.length;i++) {
          var nevent = advntx.state.events[event.action_enable_events[i]];
          if (nevent!= undefined) {
            nevent.disabled = false;
            nevent.triggered_steps = advntx.state.steps;
          }
        }
        
      }

      if (!isEmpty(event.action_untrigger_events)) {
          for (var i = 0; i < event.action_untrigger_events.length; i++) {
              var nevent = advntx.state.events[event.action_untrigger_events[i]];
              if (nevent != undefined) {
                  nevent.triggered = false;
                  nevent.triggered_steps = 0;
              }
          }

      }
      if (!isEmpty(event.description)) {
        echo(event.description + '\n');
      }
      

      event.triggered = true;
      event.triggered_steps = advntx.state.steps;



      if (!isEmpty(event.action_trigger_event)) {
          var nevent = advntx.state.events[event.action_trigger_event];
          return this.execute_event(nevent, echo);
      }

      if (!isEmpty(event.action_continue)&&event.action_continue) {
        return true;
      }
      return false;


    }

  }
  return my;
}(advntx || {}));