/**
 * Helper functions. They do not manipulate states.
 */
'use strict';


import * as constants from 'app/scripts/const.js'

export function getDescription(objects, id) {
  var obj = objects[id];
  if (obj != undefined && !isEmpty(obj.state) && obj.state != constants.NONE && obj.states != undefined) {
    var state = obj.states[obj.state];
    var desc = state['description'];
    if (!isEmpty(desc)) {
      return desc;
    }
  }
  return getProperty(objects, 'description', id)
}


export function getName(objects, id) {
  return getProperty(objects, 'name', id);
}

export function isHidden(objects, id) {
  return getProperty(objects, 'hidden', id);
}


export function getProperty(objects, property, id) {
  id = id.toLowerCase();
  var obj = objects[id];
  var state = constants.NONE;

  if (obj !== undefined && obj.state !== undefined) {
    state = obj.state;
  }

  // name can not be overriden by state.
  if (property !== 'name' && obj !== undefined && obj.states !== undefined && obj.states[state] !== undefined) {
    var retVal = obj.states[state][property];
    if (retVal !== undefined) {
      return retVal;
    }
  }

  if (obj === undefined) {
    return '';
  }
  var retVal = obj[property];
  if (retVal !== undefined)
    return retVal;
  return '';
}

export function getFirstOfType(words, type) {
  return getOfType(words, type, 0);
}


export function getSecondOfType(words, type) {
  return getOfType(words, type, 1);
}

export function getLastOfType(words, type) {
  return getOfType(words, type, words[type].length - 1);
}


export function getOfType(words, type, number) {
  if (words[type].length > number) {
    return words[type][number];
  }
  return '';
}

export function getObjectIdsForState(state) {
  var ids = [];
  if (state===undefined||state.objects===undefined) {
    return ids;
  }

  for (var i=0;i<state.objects.length;i++) {
    ids.push(state.objects[i]);
  }
  return ids;
}


export function findFirstMatch(words, type, objects) {
  for (var i = 0; i < words[type].length; i++) {
    if (objects[words[type][i]] !== undefined) {
      return words[type][i];
    }
  }
  return '';
}

export function getJSON(url, result) {
  // new fetch api of ecma6:
  fetch(url).then(function(response) {
    return response.json();
  }).then(function(json) {
    result(json);
  });
}

export function listFormattedObjects(list, list_of_all, inventoryHandler, takeVerb) {
  var message = '';
  if (list !== undefined && list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      if (isHidden(list_of_all, list[i])) {
        continue;
      }
      if (i > 0 && !isHidden(list_of_all, list[i - 1])) {
        message += ', ';
      }
      var effect = inventoryHandler.getEffect(list[i]);
      var color = inventoryHandler.getColor(list[i]);
      if (color === undefined) {
        color = '';
      }
      if (effect === undefined) {
        effect = '';
      }

      var name = getName(list_of_all, list[i]);
      message += '[[!;' + color + ';;' + effect + ';javascript:advntx.terminalLink(\' '+name+'\');]' + name;

      var stateString = inventoryHandler.getStateString(list[i]);
      if (!isEmpty(stateString)) {
        message += ' ' + stateString;
      }
      message += ']';
    }
  }
  return message;

}

export function checkSynonyms(main, to_check, synonyms) {
  if (main == to_check) {
    return true;
  }
  if (synonyms[main] == undefined) {
    return false;
  }
  if (synonyms[main].indexOf(to_check) != -1) {
    return true;
  }
  return false;
}

export function findItemIds(names, objects, allObjects) {
  var retItemIds = [];
  if (names === undefined || objects === undefined)
    return retItemIds;

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var itemIds = findItemIdsForName(name, allObjects);
    for (var i2 = 0; i2 < itemIds.length; i2++) {
      var itemId = itemIds[i2];
      var index = objects.indexOf(itemId);
      if (index != -1 && retItemIds.indexOf(itemId) == -1) {
        retItemIds.push(objects[index]);
      }
    }

  }
  return retItemIds;
}

export function setStateOfObject(id, state, objects) {
  var object = objects[id];
  if (state != constants.NONE && object.states[state] === undefined) {
    throw state + ' is not an allowed state for ' + id;
  }
  return object.state = state;
}

export function findItemIdsForName(name, objects) {
  var itemIds = [];
  for (var property in objects) {
    var item = objects[property];
    if (stringEquals(item.name,name)) {
      itemIds.push(property);
    }
    for (var synid in item.synonyms) {
      var syn = item.synonyms[synid];
      if (stringEquals(syn, name)) {
        itemIds.push(property);
      }
    }
  }
  return itemIds;
}

export function getObjectNameArray(objects) {
  var names = [];
  for (var property in objects) {
    var item = objects[property];
    names.push(item.name);
  }
  return names;
}

export function getFromStateOrObject(objectId, property, objects) {
  var object = objects[objectId];

  if (object === undefined) {
    return '';
  }

  var state = object.state;
  var effect;
  if (!isEmpty(state) && state != constants.NONE && object.states[state] != undefined) {
    effect = object.states[state][property];
  }
  if (effect === undefined) {
    effect = object[property];
  }
  return effect;
}

export function removeTargetFromLinks() {
      // HACK, remove target=blank for firefox
      $('#terminal a[target="_blank"]').removeAttr('target');
}

