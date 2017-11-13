'use strict';

import {
  checkSynonyms,
  findFirstMatch,
  findItemIds,
  findItemIdsForName,
  getDescription,
  getFirstOfType,
  getLastOfType,
  getName,
  getOfType,
  getProperty,
  getSecondOfType,
  isHidden,
  listObjects,
  setStateOfObject
} from 'app/scripts/helper.js'

export default class LocationHandler {

  constructor(state) {
    this.state = state;
  }


    removeItemFromLocation (location, item) {
      var place = this.state.locations[location];
      if (place !== undefined) {
        var loc = place.objects.indexOf(item);
        if (loc != -1) {
          place.objects.splice(loc, 1);
        }
      }
    }

    addItemToLocation (location, item) {
      var place = this.state.locations[location];
      place.objects.push(item);
    }

    inLocation (itemOrPerson) {
      var olocation = this.state.locations[this.state.location];
      if (olocation.objects.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      if (olocation.persons.indexOf(itemOrPerson.toLowerCase()) != -1) {
        return true;
      }
      return false;

    }

    //FIXME
    findItemIdsInLocation (names, location) {
      if (location==undefined) {
        return [];
      }
      return findItemIds(names, location.objects, this.state.objects);
    }

    setLocation (location_id) {
      this.state.location = location_id;
    }

    getLocationDescription (location_id) {
      var loc = this.state.locations[location_id];
      var description = getDescription(this.state.locations, location_id);
      return description += '\n';
    }

    getLocationById (location_id) {
      return this.state.locations[location_id];
    }

    findConnectionsForDirection(location, direction) {
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
    }

    visited(location_id) {
      var loc = this.getLocationById(location_id);
      if (loc.visited===undefined||loc.visited==false) {
        loc.visited = true;
        return false;
      }
      return true;
    }

}