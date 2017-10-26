/**
 * Helper functions. They do not manipulate states.
 */
'use strict';

var advntx = (function (my) {

  my.get_description = function(objects, id) {
    return my.get_property(objects, 'description', id)
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
  return my;
}(advntx || {}));
