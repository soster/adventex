'use strict';

import {
  checkSynonyms,
  findFirstMatch,
  findItemIds,
  findItemIdsForName,
  getDescription,
  getImage,
  getFirstOfType,
  getLastOfType,
  getName,
  getOfType,
  getProperty,
  getSecondOfType,
  isHidden,
  listFormattedObjects,
  getObjectIdsForState,
  setStateOfObject
} from './helper.js';

import * as constants from './const.js';

export default class LocationHandler {

  constructor(state) {
    this.state = state;
  }


  removeItemFromLocation(location, item) {
    const place = this.state.locations[location];
    if (place !== undefined && place.objects !== undefined) {
      var loc = place.objects.indexOf(item);
      if (loc != -1) {
        place.objects.splice(loc, 1);
      }

      for (let i = 0; i < place.objects.length; i++) {
        const obj = this.state.objects[place.objects[i]];
        if (!isEmpty(obj.state) && obj.state != constants.NONE && obj.states[obj.state].objects !== undefined) {
          var loc = obj.states[obj.state].objects.indexOf(item);
          if (loc != -1) {
            obj.states[obj.state].objects.splice(loc, 1);
          }
        }
      }
    }
  }

  addItemToLocation(location, item) {
    const place = this.state.locations[location];
    place.objects.push(item);
  }

  inLocation(itemOrPerson) {
    const olocation = this.state.locations[this.state.location];
    if (olocation.objects.indexOf(itemOrPerson.toLowerCase()) != -1) {
      return true;
    }
    if (olocation.persons.indexOf(itemOrPerson.toLowerCase()) != -1) {
      return true;
    }
    return false;

  }


  //FIXME
  findItemIdsInLocation(names, location) {
    if (location == undefined) {
      return [];
    }

    if (names===undefined||names.length==0) {
      return [];
    }

    let itemIds = findItemIds(names, location.objects, this.state.objects);

    if (location.objects !== undefined) {
      for (let i = 0; i < location.objects.length; i++) {
        const obj = this.state.objects[location.objects[i]];
        if (!isEmpty(obj.state) && obj.state != constants.NONE) {
          itemIds = itemIds.concat(findItemIds(names, obj.states[obj.state].objects, this.state.objects));
        }
      }
    }

    if (!isEmpty(location.state) && location.state != constants.NONE && location.states[location.state].objects !== undefined) {
      itemIds = itemIds.concat(findItemIds(names, location.states[location.state], this.state.objects));
    }
    return itemIds;
  }

  getItemIdsFromLocation(location) {
    let itemIds = [];
    if (location.objects != undefined) {
      itemIds = itemIds.concat(location.objects);
    }

    if (!isEmpty(location.state) && location.state != constants.NONE) {
      itemIds = itemIds.concat(getObjectIdsForState(location.states[location.state]));
    }

    if (location.objects !== undefined) {

      for (let i = 0; i < location.objects.length; i++) {
        const obj = this.state.objects[location.objects[i]];
        if (obj===undefined) {
          throw "object " +location.objects[i] + " does not exist!"
        }
        if (!isEmpty(obj.state) && obj.state != constants.NONE) {
          itemIds = itemIds.concat(getObjectIdsForState(obj.states[obj.state]));
        }
      }
    }

    return itemIds;
  }

  setLocation(location_id) {
    this.state.location = location_id;
  }

  getLocationDescription(location_id) {
    const loc = this.state.locations[location_id];
    const description = getDescription(this.state.locations, location_id);
    return description;
  }


  getLocationImage(location_id) {
    const loc = this.state.locations[location_id];
    if (loc!=undefined) {
      const image = getImage(this.state.locations, location_id);
      return image;
    }
    return undefined;
  }

  getLocationById(location_id) {
    return this.state.locations[location_id];
  }

  findConnectionsForDirection(location, direction) {
    const state = location.state;
    if (!isEmpty(state) && location.states != undefined) {
      const stateObj = location.states[state];
      if (stateObj != undefined && stateObj.connections != undefined) {
        return stateObj.connections[direction];
      }
    }
    if (location.connections !== undefined && location.connections[direction] !== undefined) {
      return (location.connections[direction]);
    }

    for (let i = 0; i < location.objects.length; i++) {
      const obj = this.state.objects[location.objects[i]];
      if (obj=== undefined) {
        throw "Object" + location.objects[i] + " not found";
      }
      if (!isEmpty(obj.state) && obj.state != constants.NONE) {
        const connections = obj.states[obj.state].connections;
        if (connections !== undefined && (location.reversed === undefined || location.reversed.indexOf(location.objects[i]) == -1)) {
          return connections[direction];
        }

        if (location.reversed !== undefined && location.reversed.indexOf(location.objects[i]) != -1 && obj.states[obj.state].reversed_connections !== undefined) {
          return obj.states[obj.state].reversed_connections[direction];
        }
      }
    }
    return undefined;
  }

  visited(location_id) {
    const loc = this.getLocationById(location_id);
    if (loc === undefined) {
      return false;
    }
    if (loc.visited === undefined || loc.visited == false) {
      loc.visited = true;
      return false;
    }
    return true;
  }

}