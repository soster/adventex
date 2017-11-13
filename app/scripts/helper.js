/**
 * Helper functions. They do not manipulate states.
 */
'use strict';


export function getDescription(objects, id) {
  var obj = objects[id];
  if (obj != undefined && !isEmpty(obj.state) && obj.state != 'none' && obj.states != undefined) {
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


export function findFirstMatch(words, type, objects) {
  for (var i = 0; i < words[type].length; i++) {
    if (objects[words[type][i]] !== undefined) {
      return words[type][i];
    }
  }
  return '';
}

export function listObjects(list, list_of_all, inventoryHandler) {
  var message = '';
  if (list !== undefined && list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      if (isHidden(list_of_all, list[i])) {
        continue;
      }
      if (i > 0 && !isHidden(list_of_all, list[i - 1])) {
        message += ', ';
      }
      message += getName(list_of_all, list[i]);
      var stateString = inventoryHandler.get_state_string(list[i]);
      if (!isEmpty(stateString)) {
        message += ' ' + stateString;
      }
    }
    message += '\n';
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
  if (state != 'none' && object.states[state] === undefined) {
    throw state + ' is not an allowed state for ' + id;
  }
  return object.state = state;
}

export function findItemIdsForName(name, objects) {
  var itemIds = [];
  for (var property in objects) {
    var item = objects[property];
    if (item.name.endsWith(name) && itemIds.indexOf(item.name) == -1) {
      itemIds.push(property);
    }
  }
  return itemIds;
}

