/**
 * Helper functions. They do not manipulate states.
 */
'use strict';

  
  export function get_description (objects, id) {
    var obj = objects[id];
    if (obj!=undefined && !isEmpty(obj.state) && obj.state!='none' && obj.states != undefined) {
      var state = obj.states[obj.state];
      var desc = state['description'];
      if (!isEmpty(desc)) {
        return desc;
      }
    }
    return get_property(objects, 'description', id)
  }


  export function get_name (objects, id) {
    return get_property(objects, 'name', id);
  }

  export function is_hidden (objects, id) {
    return get_property(objects, 'hidden', id);
  }


  export function get_property(objects, property, id) {
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

  export function get_first_of_type(words, type) {
    return get_of_type(words, type, 0);
  }


  export function get_second_of_type (words, type) {
    return get_of_type(words, type, 1);
  }

  export function get_last_of_type(words, type) {
    return get_of_type(words, type, words[type].length - 1);
  }


  export function get_of_type(words, type, number) {
    if (words[type].length > number) {
      return words[type][number];
    }
    return '';
  }


  export function find_first_match (words, type, objects) {
    for (var i = 0; i < words[type].length; i++) {
      if (objects[words[type][i]] !== undefined) {
        return words[type][i];
      }
    }
    return '';
  }

  export function list_objects(list, list_of_all, inventoryHandler) {
    var message = '';
    if (list !== undefined && list.length > 0) {
      for (var i = 0; i < list.length; i++) {
        if (is_hidden(list_of_all, list[i])) {
          continue;
        }
        if (i > 0 && !is_hidden(list_of_all, list[i - 1])) {
          message += ', ';
        }
        message += get_name(list_of_all, list[i]);
        var stateString = inventoryHandler.get_state_string(list[i]);
        if (!isEmpty(stateString)) {
          message += ' '+stateString;
        }
      }
      message += '\n';
    }
    return message;

  }

  export function check_synonyms(main, to_check, synonyms) {
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

  export function find_item_ids (names, objects, allObjects) {
    var retItemIds = [];
    if (names===undefined || objects===undefined)
      return retItemIds;

    for (var i=0;i<names.length;i++) {
      var name = names[i];
      var itemIds = find_item_ids_for_name(name, allObjects);
      for (var i2=0;i2<itemIds.length;i2++) {
        var itemId = itemIds[i2];
        var index = objects.indexOf(itemId);
        if (index!=-1 && retItemIds.indexOf(itemId)==-1) {
          retItemIds.push(objects[index]);
        }
      }

    }
    return retItemIds;
  }

  export function set_state_of_object(id,state,objects) {
    var object = objects[id];
    if (state!='none'&&object.states[state]===undefined) {
      throw state+' is not an allowed state for '+id;
    }
    return object.state=state;
  }

  export function find_item_ids_for_name(name,objects) {
    var itemIds = [];
    for (var property in objects) {
      var item = objects[property];
      if (item.name.endsWith(name) && itemIds.indexOf(item.name)==-1) {
        itemIds.push(property);
      }
    }
    return itemIds;
  }

