'use strict';
export default function eventhandler(my) {
  var advntx = my;

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
        var arr = prereq[i].split('|');
        if (to_check.indexOf(arr[0])==-1) {
          return false;
        } else {
          if (arr.length>1) {
            var state = advntx.inventoryhandler.get_state_of_object(arr[0]);
            if (state==undefined && arr[1]=='none') {
              continue;
            }
            if (state!=arr[1]) {
              return false;
            }
          }
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
        var arr = prereq[i].split('|');
        if (to_check.indexOf(arr[0])!=-1) {
          if (arr.length>1) {
            var state = advntx.inventoryhandler.get_state_of_object(arr[0]);
            if (state==arr[1]) {
              return false;
            }
          } else {
            return false;
          }
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

    check_event_prereq_location_state: function(prereq) {
      if (isEmpty(prereq)) {
        return true;
      }
      var arr = prereq.split('|');
      if (arr.length==2) {
        var location = advntx.state.locations[arr[0]];
        if (location.state==arr[1]) {
          return true;
        } else if (location.state===undefined&&arr[1]=='none') {
          return true;
        }
      } else {
        throw 'location and state for prereq not set!';
      }
      return false;
    },

    check_trigger_once: function(event) {
      if (event.triggered===undefined||event.triggered==false||event.trigger_once === undefined) {
        return true;
      }

      if (event.triggered==true&&event.trigger_once==true) {
        return false;
      }
    },

    find_events: function (location, used_items, location_items, verb, preposition, events) {
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
            && this.check_event_prereq_array(event.prereq_location_items, location_items)
            && this.check_event_prereq_inventory(event.prereq_inventory_items)
            && this.check_event_prereq_location_state(event.prereq_location_state)
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
          var temp = event.action_add_items[i].split(':');
          if (temp.length==1) {//inventory
            var stateSplit = temp[0].split('|');
            if (stateSplit.length==2) {
              advntx.state.objects[stateSplit[0]].state = stateSplit[1];
            }
            advntx.inventoryhandler.add_to_inventory(stateSplit[0]);
          } else if (temp.length==2) {//location
            var location;
            if (temp[0]=='location') {
              location = advntx.state.locations[advntx.state.location];
            } else {
              location = advntx.state.locations[temp[0]];
            }

            var stateSplit = temp[1].split('|');
            if (stateSplit.length==2) {
              advntx.state.objects[stateSplit[0]].state = stateSplit[1];
            }

            if (location.objects[stateSplit[0]]===undefined) {
              location.objects.push(stateSplit[0]);
            }
          }
        } 
      }

      if (!isEmpty(event.action_remove_items)) {
        // from the inventory
        for (var i=0;i<event.action_remove_items.length;i++) {
          var temp = event.action_remove_items[i].split(':');
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
          var temp = event.action_new_connections[i].split(':');
          var place = advntx.state.locations[temp[0]];
          var direction = temp[1];
          var to = temp[2];
          place.connections[direction] = to;
        }
      }

      if (!isEmpty(event.action_move_to_location)) {
        advntx.locationhandler.set_location(event.action_move_to_location);
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

      if (!isEmpty(event.action_set_state_items)) {
        for (var i=0;i<event.action_set_state_items.length;i++) {
          var arr = event.action_set_state_items[i].split('|');
          advntx.set_state_of_object(arr[0],arr[1],advntx.state.objects);
        }
      }

      if (!isEmpty(event.action_set_state_locations)) {
        for (var i=0;i<event.action_set_state_locations.length;i++) {
          var arr = event.action_set_state_locations[i].split('|');
          advntx.set_state_of_object(arr[0],arr[1],advntx.state.locations);
        }
      }

      if (!isEmpty(event.action_points)) {
        advntx.state.points+=event.action_points;
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
}