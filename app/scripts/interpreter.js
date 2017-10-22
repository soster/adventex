/**
 * Interpret commands.
 */

var Interpreter =  {
  interpret:function (command, describe_location_echo, add_to_inventory_echo, echo) {
    var original = command; 

    command = command.toLowerCase(); 
    if (command == 'help') {
      echo(MESSAGE.help); 
    }else if (command == 'debug' && CONFIG.debug) {
      echo(JSON.stringify(state)); 
    }else {
      var words = parser.parse(command); 
      var first_verb = get_first_of_type(words, 'verbs'); 
      var first_misc = get_first_of_type(words, 'misc');
      var second_misc = get_second_of_type(words, 'misc'); 
      var last_misc = get_last_of_type(words, 'misc');
      var preposition = get_first_of_type(words, 'prepositions');
      
      var found_nothing = false;
      if (check_synonyms('go', first_verb)) {
        var direction = get_first_of_type(words, 'directions'); 
        this.move(direction); 
      }else if (check_synonyms('take', first_verb)) {
        this.get_item(last_misc); 
      }else if (check_synonyms('examine', first_verb)) {
        this.examine(last_misc); 
      }else {// I give up...
        found_nothing = true;
      }
      var event = eventhandler.find_event(state.location, first_misc, second_misc, first_verb, preposition);
      if (event!==undefined) {
        this.trigger_event(event);
        state.steps++;
      }  else if (found_nothing) {
        this.standard_error(command);
      } else {
        state.steps++;
      }

    }
    return ''; 
  }, 


move:function(direction) {
  var location = state.locations[state.location]; 
  if (location.connections[direction] !== undefined) {
    var new_location = location.connections[direction];
    locationhandler.set_location(new_location);
    describe_location_echo(new_location); 
  }else {
    echo(MESSAGE.error_movement.format(direction), 'red'); 
  }
}, 

get_item:function(item) {
  var item_id = locationhandler.find_item_id_for_name(item);

  if (!isEmpty(item_id)) {
    echo(get_description(things, item_id)); 
    if ( ! inventoryhandler.is_portable(item_id)) {
      var portable_error = inventoryhandler.get_portable_error(item_id);
      if (!isEmpty(portable_error)) {
        echo(portable_error, 'red');
      } else {
        echo(MESSAGE.error_portable.format(item), 'red'); 
      }
      
    }else {
      add_to_inventory_echo(item_id);
      locationhandler.remove_item_from_location(state.location, item_id); 
    }
  }else {
    echo(MESSAGE.error_get.format(item), 'red'); 
  }
}, 

examine:function(item) {
  if (isEmpty(item)) {
    describe_location_echo(state.location); 
  }else {
    var item_id = locationhandler.find_item_id_for_name(item);
    if (isEmpty(item_id)) {
      item_id = inventoryhandler.find_item_id_for_name(item);
    }
    if (!isEmpty(item_id)) {
      var desc = get_description(state.things, item_id); 
      echo(desc); 
    }else if (!isEmpty(item)) {
      echo(MESSAGE.error_thing.format(item), 'red'); 
    }else {
      this.standard_error(command); 
    }
  }
},

trigger_event:function(event) {
  var old_location = state.location;
  setTimeout(function() {
    eventhandler.execute_event(event);
    echo(event.description+'\n');
    
    if (old_location != state.location) {
      setTimeout(describe_location_echo(state.location), CONFIG.standard_event_wait);
    }
  }, CONFIG.standard_event_wait);

  
},

standard_error:function(command) {
  echo(MESSAGE.error.format(command), 'red'); 
}, 

/**
 * Checks a command for equality and for synonyms.
 */
check:function(input, to_check) {
  if (input == to_check) {
    return true; 
  }
  if (synonyms[to_check] != undefined) {
    if (synonyms[to_check].indexOf(input) != -1) {
      return true; 
    }
  }
  return false; 

}



};