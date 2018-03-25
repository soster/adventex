'use strict';

import {
  checkSynonyms,
  setStateOfObject
} from 'app/scripts/helper.js'

import InventoryHandler from 'app/scripts/inventoryhandler.js';
import LocationHandler from 'app/scripts/locationhandler.js';

import * as constants from 'app/scripts/const.js';

export default class EventHandler {

  constructor(state, vocabulary, initInventory) {
    this.state = state;
    this.vocabulary = vocabulary;
    this.initInventory = initInventory;

    this.inventoryHandler = new InventoryHandler(state, initInventory);
    this.locationHandler = new LocationHandler(state);

  }

  checkEventPrereq(prereq, to_check) {
    if (isEmpty(prereq) || prereq == to_check) {
      return true;
    }
    return false;
  }

  checkEventPrereqInventory(prereq) {
    return this.checkEventPrereqArray(prereq, this.state.inventory);
  }

  checkEventPrereqNotInventory(prereq) {
    return this.checkEventPrereqNotArray(prereq, this.state.inventory);
  }

  checkEventPrereqArray(prereq, to_check) {
    if (prereq === undefined || prereq == '') {
      return true;
    }

    if (to_check === undefined) {
      return false;
    }

    for (var i = 0; i < prereq.length; i++) {
      var arr = prereq[i].split('|');
      if (to_check.indexOf(arr[0]) == -1) {
        return false;
      } else {
        if (arr.length > 1) {
          var state = this.inventoryHandler.getStateOfObject(arr[0]);
          if (state == undefined && arr[1] == constants.NONE) {
            continue;
          }
          if (state != arr[1]) {
            return false;
          }
        }
      }
    }

    return true;
  }

  checkEventPrereqNotArray(prereq, to_check) {
    if (prereq === undefined || prereq == '') {
      return true;
    }

    if (to_check === undefined) {
      return true;
    }

    for (var i = 0; i < prereq.length; i++) {
      var arr = prereq[i].split('|');
      if (to_check.indexOf(arr[0]) != -1) {
        if (arr.length > 1) {
          var state = this.inventoryHandler.get_state_of_object(arr[0]);
          if (state == arr[1]) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  }

  /** checks if the events in the list are already triggered AND enabled */
  checkTriggeredEvents(prereq_triggered_events, prereq_triggered_event_step_offset) {
    if (isEmpty(prereq_triggered_events)) {
      return true;
    }

    for (var i = 0; i < prereq_triggered_events.length; i++) {
      var event = this.state.events[prereq_triggered_events[i]];
      if (event === undefined) {
        return true;
      }
      if ((event.triggered === undefined || event.triggered == false) || (event.disabled != undefined && event.disabled == true)) {
        return false;
      } else if (prereq_triggered_event_step_offset != undefined && prereq_triggered_event_step_offset > 0) {
        if (this.state.steps - event.triggered_steps < prereq_triggered_event_step_offset) {
          return false;
        }
      }
    }
    return true;
  }

  checkVisitedLocations(prereq_visited_locations) {
    if (isEmpty(prereq_visited_locations)) {
      return true;
    }

    for (var i = 0; i < prereq_visited_locations.length; i++) {
      var loc = this.state.locations[prereq_visited_locations[i]];
      if (loc.visited === undefined || loc.visited == false) {
        return false;
      }
    }
    return true;
  }

  checkEventPrereqLocationState(prereq) {
    if (isEmpty(prereq)) {
      return true;
    }
    var arr = prereq.split('|');
    if (arr.length == 2) {
      var location = this.state.locations[arr[0]];
      if (location === undefined) {
        return false;
      }
      if (location.state == arr[1]) {
        return true;
      } else if (location.state === undefined && arr[1] == constants.NONE) {
        return true;
      }
    } else {
      throw 'location and state for prereq not set!';
    }
    return false;
  }

  checkTriggerOnce(event) {
    if (event.triggered === undefined || event.triggered == false || event.trigger_once === undefined) {
      return true;
    }

    if (event.triggered == true && event.trigger_once == true) {
      return false;
    }
  }

  findEvents(location, used_items, location_items, verb, preposition, events) {
    var retEvents = [];
    for (var property in events) {
      if (events.hasOwnProperty(property) && property != 'start_event') {
        var event = events[property];
        if (event.disabled != undefined && event.disabled) {
          continue;
        }
        if (!isEmpty(event.prereq_verb) && !isEmpty(verb)) {
          if (checkSynonyms(event.prereq_verb, verb, this.vocabulary.synonyms)) {
            verb = event.prereq_verb;
          }
        }


        var keyNames = Object.keys(event);
        var condition = true;

        // all of them
        for (var i = 0; i < keyNames.length; i++) {
          var name = keyNames[i];
          if (name.startsWith('prereq')) {
            if (!this.checkGeneralPrereq(name, event[name], event, location, used_items, location_items, verb, preposition)) {
              condition = false;
              break;
            }
          }
        }


        // none of them
        if (condition && event.not != undefined) {
          keyNames = Object.keys(event.not);
          for (var i = 0; i < keyNames.length; i++) {
            var name = keyNames[i];
            if (name.startsWith('prereq')) {
              if (this.checkGeneralPrereq(name, event.not[name], event, location, used_items, location_items, verb, preposition)) {
                condition = false;
                break;
              }
            }
          }
        }


        // any of them
        if (condition && event.any != undefined) {
          keyNames = Object.keys(event.any);
          for (var i = 0; i < keyNames.length; i++) {
            var name = keyNames[i];
            if (name.startsWith('prereq')) {
              if (this.checkGeneralPrereq(name, event.any[name], event, location, used_items, location_items, verb, preposition)) {
                condition = true;
                break;
              }
            }
          }
        }



        if (condition && this.checkTriggerOnce(event)) {
          retEvents.push(event);
        }
      }
    }

    return retEvents;
  }

  checkGeneralPrereq(prereq_name, prereq, event, location, used_items, location_items, verb, preposition) {
    switch (prereq_name) {
      case 'prereq_location':
        return this.checkEventPrereq(prereq, location);
        break;
      case 'prereq_verb':
        return this.checkEventPrereq(prereq, verb);
        break;
      case 'prereq_preposition':
        return this.checkEventPrereq(prereq, preposition);
        break;
      case 'prereq_used_items':
        return this.checkEventPrereqArray(prereq, used_items)
        break;
      case 'prereq_location_items':
        return this.checkEventPrereqArray(prereq, location_items)
        break;
      case 'prereq_inventory_items':
        return this.checkEventPrereqInventory(prereq);
        break;
      case 'prereq_location_state':
        return this.checkEventPrereqLocationState(prereq);
        break;
      case 'prereq_triggered_events':
        return this.checkTriggeredEvents(prereq, event.prereq_triggered_event_step_offset)
        break;
      case 'prereq_visited_locations':
        return this.checkVisitedLocations(prereq);
        break;
    }
    return false;
  }

  add_items(action) {
    // into the inventory
    for (var i = 0; i < action.length; i++) {
      var temp = action[i].split(':');
      if (temp.length == 1) {//inventory
        var stateSplit = temp[0].split('|');
        if (stateSplit.length == 2) {
          this.state.objects[stateSplit[0]].state = stateSplit[1];
        }
        this.inventoryHandler.addToInventory(stateSplit[0]);
      } else if (temp.length == 2) {//location
        var location;
        if (temp[0] == constants.LOCATION) {
          location = this.state.locations[this.state.location];
        } else {
          location = this.state.locations[temp[0]];
        }

        var stateSplit = temp[1].split('|');
        if (stateSplit.length == 2) {
          this.state.objects[stateSplit[0]].state = stateSplit[1];
        }

        if (location.objects[stateSplit[0]] === undefined) {
          location.objects.push(stateSplit[0]);
        }
      }
    }
  }

  remove_items(action) {
    // from the inventory
    for (var i = 0; i < action.length; i++) {
      var temp = action[i].split(':');
      if (temp.length == 1) {//inventory
        var ilength = this.state.inventory.length;
        this.inventoryHandler.removeFromInventory(temp[0]);
        if (this.state.inventory.length < ilength) {
          return true;
        }
        return false;
      } else if (temp.length == 2) {
        var location;
        if (temp[0] == constants.LOCATION) {
          location = this.state.locations[this.state.location];
        } else {
          location = this.state.locations[temp[0]];
        }
        var olength = location.objects.length;
        location.objects.remove(temp[1]);
        if (location.objects.length < olength) {
          return true;
        }
        return false;
      }
    }
  }

  move_items(action) {
    for (var i = 0; i < action.length; i++) {
      var temp = action[i].split(':');
      if (temp.length == 3) {
        var obj = temp[0];
        var from = temp[1];
        var to = temp[2];
        var removed = false;

        if (from === constants.INVENTORY) {
          removed = this.remove_items(obj);
        } else {
          removed = this.remove_items([from + ':' + obj]);
        }

        if (to === constants.INVENTORY && removed) {
          this.add_items(obj);
        } else if (removed) {
          this.add_items([to+':'+obj]);
        }
      }
    }
  }

  executeEvent(event, echo) {
    if (!isEmpty(event.action_move_items)) {
      this.move_items(event.action_move_items);
    }


    if (!isEmpty(event.action_add_items)) {
      this.add_items(event.action_add_items);
    }

    if (!isEmpty(event.action_remove_items)) {
      this.remove_items(event.action_remove_items);
    }



    if (!isEmpty(event.action_new_connections)) {
      for (var i = 0; i < event.action_new_connections.length; i++) {
        var temp = event.action_new_connections[i].split(':');
        var place = this.state.locations[temp[0]];
        var direction = temp[1];
        var to = temp[2];
        place.connections[direction] = to;
      }
    }

    if (!isEmpty(event.action_move_to_location)) {
      this.locationHandler.setLocation(event.action_move_to_location);
    }

    if (!isEmpty(event.action_disable_events)) {
      for (var i = 0; i < event.action_disable_events.length; i++) {
        var nevent = this.state.events[event.action_disable_events[i]];
        nevent.disabled = true;
      }
    }

    if (!isEmpty(event.action_enable_events)) {
      for (var i = 0; i < event.action_enable_events.length; i++) {
        var nevent = this.state.events[event.action_enable_events[i]];
        if (nevent != undefined) {
          nevent.disabled = false;
          nevent.triggered_steps = this.state.steps;
        }
      }

    }

    if (!isEmpty(event.action_untrigger_events)) {
      for (var i = 0; i < event.action_untrigger_events.length; i++) {
        var nevent = this.state.events[event.action_untrigger_events[i]];
        if (nevent != undefined) {
          nevent.triggered = false;
          nevent.triggered_steps = 0;
        }
      }

    }
    if (!isEmpty(event.description)) {
      echo(event.description);
    }

    if (!isEmpty(event.action_set_state_items)) {
      for (var i = 0; i < event.action_set_state_items.length; i++) {
        var arr = event.action_set_state_items[i].split('|');
        setStateOfObject(arr[0], arr[1], this.state.objects);
      }
    }

    if (!isEmpty(event.action_set_state_locations)) {
      for (var i = 0; i < event.action_set_state_locations.length; i++) {
        var arr = event.action_set_state_locations[i].split('|');
        setStateOfObject(arr[0], arr[1], this.state.locations);
      }
    }

    if (!isEmpty(event.action_points)) {
      this.state.points += event.action_points;
    }


    event.triggered = true;
    event.triggered_steps = this.state.steps;



    if (!isEmpty(event.action_trigger_event)) {
      var nevent = this.state.events[event.action_trigger_event];
      return this.executeEvent(nevent, echo);
    }

    if (!isEmpty(event.action_continue) && event.action_continue) {
      return true;
    }
    return false;


  }

}