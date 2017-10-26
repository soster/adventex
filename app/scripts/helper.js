/**
 * Helper functions. They do not manipulate states.
 */
'use strict';
function get_description(objects, id) {
  return get_property(objects, 'description', id)
}


function get_name(objects, id) {
  return get_property(objects, 'name', id);
}

function is_hidden(objects, id) {
  return get_property(objects, 'hidden', id);
}


function get_property(objects, property, id) {
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

function get_first_of_type(words, type) {
  return get_of_type(words, type, 0);
}


function get_second_of_type(words, type) {
  return get_of_type(words, type, 1);
}

function get_last_of_type(words, type) {
  return get_of_type(words, type, words[type].length-1);
}


function get_of_type(words, type, number) {
  if (words[type].length > number) {
    return words[type][number];
  }
  return '';
}


function find_first_match(words, type, objects) {
  for (var i=0;i<words[type].length;i++) {
    if (objects[words[type][i]]!== undefined) {
      return words[type][i];
    }
  }
  return '';
}

function list_objects(list, list_of_all) {
  var message = '';
  if (list !== undefined && list.length>0) {
    for (var i=0;i<list.length;i++) {
      if (is_hidden(list_of_all, list[i])) {
        continue;
      }
      if (i>0 && !is_hidden(list_of_all, list[i-1])) {
        message+=', ';
      }
      message+=get_name(list_of_all,list[i]);
    }
    message+='\n';
  } 
  return message;
  
}

function check_synonyms(main, to_check) {
  if (main == to_check) {
    return true;
  }
  if (vocabulary.synonyms[main]==undefined) {
    return false;
  }
  if (vocabulary.synonyms[main].indexOf(to_check) != -1) {
    return true; 
  }
  return false;
}

