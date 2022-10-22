'use strict';

import {
  checkSynonyms,
  setStateOfObject,
  listFormattedObjects
} from './helper.js'

import InventoryHandler from './inventoryhandler.js';
import LocationHandler from './locationhandler.js';
import EventActionHandler from './eventactionhandler.js';

import * as constants from './const.js';




export default class EventHandler {

  constructor(state, vocabulary, initInventory) {
    this.state = state;
    this.vocabulary = vocabulary;
    this.initInventory = initInventory;

    this.inventoryHandler = new InventoryHandler(state, initInventory);
    this.locationHandler = new LocationHandler(state);

    // ActionEventHandler as object properties, later it should be possible to have new ActionEvents per game:
    EventActionHandler.create_action_handler_properties(this, this.state, this.vocabulary, this.inventoryHandler, this.locationHandler, this.echo);
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



  executeEvent(event, echo) {
    var location = this.state.locations[this.state.location];
    var objects_message_before = listFormattedObjects(location.objects, this.state.objects, this.inventoryHandler);

    for (var property in event) {
      if (event.hasOwnProperty(property)) {
        if (property.startsWith(constants.ACTION_PREFIX)) {
          var handler = this[property];
          if (handler !== undefined) {
            handler.execute_action(event[property]);
          }
        }
      }
    }

    if (!isEmpty(event.description)) {
      echo(event.description);
    }

    event.triggered = true;
    event.triggered_steps = this.state.steps;

    if (!isEmpty(event.action_trigger_event)) {
      var nevent = this.state.events[event.action_trigger_event];
      return this.executeEvent(nevent, echo);
    }

    var objects_message = listFormattedObjects(location.objects, this.state.objects, this.inventoryHandler);
    if (objects_message !== objects_message_before && objects_message.length > 0) {
      echo(advntx.messages.info_you_see+'\n'+ objects_message);
    }

    if (!isEmpty(event.action_continue) && event.action_continue) {
      return true;
    }
    return false;


  }

}