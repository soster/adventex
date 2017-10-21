/**
 * Interpret commands.
 */

var Interpreter =  {
  interpret:function (command, set_location, add_to_inventory, echo) {
    var original = command; 
    var chk = this.check; 
    command = command.toLowerCase(); 
    if (command == 'help') {
      echo(MESSAGE.help); 
    }else if (command == 'debug' && CONFIG.debug) {
      echo(JSON.stringify(state)); 
    }else {
      var words = parser.parse(command); 
      var first_verb = get_first_of_type(words, 'verbs'); 
      var first_misc = get_first_of_type(words, 'misc');
      var preposition = get_first_of_type(words, 'prepositions');
      var second_misc = get_second_of_type(words, 'misc'); 

      if (chk(first_verb, 'go')) {
        var direction = get_first_of_type(words, 'directions'); 
        this.move(direction); 
      }else if (chk(first_verb, 'take')) {
        var thing = first_misc; 
        this.get_item(thing); 
      }else if (chk(first_verb, 'examine')) {
        this.examine(words, first_misc); 
      }else {// I give up...
        var event = find_event(state.location, first_misc, second_misc, first_verb, preposition);
        if (event!==undefined) {
          this.trigger_event(event);
        } else {
          this.standard_error(command); 
        }
      }
    }
    return ''; 
  }, 


move:function(direction) {
  var location = state.locations[state.location]; 
  if (location.connections[direction] !== undefined) {
    var new_location = location.connections[direction]; 
    set_location(new_location); 
  }else {
    echo(MESSAGE.error_movement.format(direction), 'red'); 
  }
}, 

get_item:function(item) {
  if (in_location(item)) {
    echo(get_description(things, item)); 
    if ( ! is_portable(item)) {
      echo(MESSAGE.error_portable.format(item), 'red'); 
    }else {
      add_to_inventory(item); 
      remove_item_from_location(state.location, item); 
    }
  }else {
    echo(MESSAGE.error_get.format(item), 'red'); 
  }
}, 

examine:function(words, first_misc) {
  var thing = find_first_match(words, 'misc', state.things); 
  if (thing == '' && first_misc == '') {
    describe_location(state.location); 
  }else {
    if (in_inventory(thing) || in_location(thing)) {
      var desc = get_description(state.things, thing); 
      echo(desc); 
    }else if (first_misc != '') {
      echo(MESSAGE.error_thing.format(first_misc), 'red'); 
    }else {
      this.standard_error(command); 
    }
  }
},

trigger_event:function(event) {
  echo(event.description);
  execute_event(event);
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



}