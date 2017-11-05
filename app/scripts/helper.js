/**
 * Helper functions. They do not manipulate states.
 */
'use strict';

var advntx = (function (my) {

  my.get_description = function(objects, id) {
    var obj = objects[id];
    if (obj!=undefined && !isEmpty(obj.state) && obj.state!='none' && obj.states != undefined) {
      var state = obj.states[obj.state];
      var desc = state['description'];
      if (!isEmpty(desc)) {
        return desc;
      }
    }
    return my.get_property(objects, 'description', id)
  }

  my.test = function(echo) {
    return echo;
  }


  my.get_name = function(objects, id) {
    return my.get_property(objects, 'name', id);
  }

  my.is_hidden = function(objects, id) {
    return my.get_property(objects, 'hidden', id);
  }


  my.get_property = function(objects, property, id) {
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

  my.get_first_of_type = function(words, type) {
    return my.get_of_type(words, type, 0);
  }


  my.get_second_of_type = function(words, type) {
    return my.get_of_type(words, type, 1);
  }

  my.get_last_of_type = function(words, type) {
    return my.get_of_type(words, type, words[type].length - 1);
  }


  my.get_of_type = function(words, type, number) {
    if (words[type].length > number) {
      return words[type][number];
    }
    return '';
  }


  my.find_first_match = function(words, type, objects) {
    for (var i = 0; i < words[type].length; i++) {
      if (objects[words[type][i]] !== undefined) {
        return words[type][i];
      }
    }
    return '';
  }

  my.list_objects = function(list, list_of_all) {
    var message = '';
    if (list !== undefined && list.length > 0) {
      for (var i = 0; i < list.length; i++) {
        if (my.is_hidden(list_of_all, list[i])) {
          continue;
        }
        if (i > 0 && !my.is_hidden(list_of_all, list[i - 1])) {
          message += ', ';
        }
        message += my.get_name(list_of_all, list[i]);
        var stateString = advntx.inventoryhandler.get_state_string(list[i]);
        if (!isEmpty(stateString)) {
          message += ' '+stateString;
        }
      }
      message += '\n';
    }
    return message;

  }

  my.check_synonyms = function(main, to_check) {
    if (main == to_check) {
      return true;
    }
    if (advntx.vocabulary.synonyms[main] == undefined) {
      return false;
    }
    if (advntx.vocabulary.synonyms[main].indexOf(to_check) != -1) {
      return true;
    }
    return false;
  }

  my.find_item_ids = function (names, objects, allObjects) {
    var retItemIds = [];
    if (names===undefined || objects===undefined)
      return retItemIds;

    for (var i=0;i<names.length;i++) {
      var name = names[i];
      var itemIds = my.find_item_ids_for_name(name, allObjects);
      for (var i2=0;i2<itemIds.length;i2++) {
        var itemId = itemIds[i2];
        var index = objects.indexOf(itemId);
        if (index!=-1 && retItemIds.indexOf(itemId)==-1) {
          retItemIds.push(objects[index]);
        }
      }

    }
    return retItemIds;
  },

  my.set_state_of_object = function(id,state,objects) {
    var object = objects[id];
    if (state!='none'&&object.states[state]===undefined) {
      throw state+' is not an allowed state for '+id;
    }
    return object.state=state;
  },

  my.find_item_ids_for_name = function (name,objects) {
    var itemIds = [];
    for (var property in objects) {
      var item = objects[property];
      if (item.name.endsWith(name) && itemIds.indexOf(item.name)==-1) {
        itemIds.push(property);
      }
    }
    return itemIds;
  }, 

  my.parse_json = function (async_init) {
    var jsons = 0;
    const num_requests_necessary = 4;
    const parameter = '?v=12';

    function async_init_local() {
      advntx.vocabulary.objects = [];
      for (var property in advntx.state.objects) {
        var item = advntx.state.objects[property];
        advntx.vocabulary.objects.push(item.name);
      }
      async_init(true);
    }

    $.getJSON('json/vocabulary.json' + parameter,
      function (result) {
        advntx.vocabulary = JSON.parse(JSON.stringify(result));
        jsons++;
        if (jsons == num_requests_necessary) {
          async_init_local();
        }

      });

    $.getJSON('json/messages.json' + parameter,
      function (result) {
        advntx.messages = JSON.parse(JSON.stringify(result));
        jsons++;
        if (jsons == num_requests_necessary) {
          async_init_local();
        }
      });

    $.getJSON('json/gamestate.json' + parameter,
      function (result) {
        advntx.state = JSON.parse(JSON.stringify(result));
        jsons++;
        if (jsons == num_requests_necessary) {
          async_init_local();
        }

      });

    $.getJSON('json/config.json' + parameter,
      function (result) {
        advntx.config = JSON.parse(JSON.stringify(result));
        jsons++;
        if (jsons == num_requests_necessary) {
          async_init_local();
        }

      });

  }

  return my;
}(advntx || {}));
