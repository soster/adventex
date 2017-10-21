/**
 * Helper functions. They do not manipulate states.
 */

function get_description(objects, id) {
  return get_property(objects, 'description', id)
}


function get_name(objects, id) {
  return get_property(objects, 'name', id);
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

function list_stuff(list, list_of_all) {
  var message = '';
  if (list !== undefined && list.length>0) {
    for (var i=0;i<list.length;i++) {
      message+=get_name(list_of_all,list[i]);
      if (i<list.length-1)
      message+=', ';
    }
    message+='\n';
  } 
  return message;
  
}

