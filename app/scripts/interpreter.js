var Interpreter = {
  interpret: function (command, set_location, add_to_inventory, echo) {
    var original = command;
    var chk = this.check;
    var mv = this.move;
    command = command.toLowerCase();
    if (command == 'help') {
      echo(MESSAGE.help);
    } else if (command == 'debug' && CONFIG.debug) {
      echo(JSON.stringify(state));
    } else {
      var words = parser.parse(command);
      if (chk(get_first_of_type(words,'verbs'),'go')) {
        var direction = get_first_of_type(words, 'directions');
        mv(direction);
      } else if (chk(get_first_of_type(words,'verbs'),'take')) {
        var thing = get_first_of_type(words, 'things');
        this.get_item(thing);
      } else if (chk(get_first_of_type(words,'verbs'),'examine')) {
        var thing = get_first_of_type(words, 'things');
        if (thing=='') {
          this.standard_error(command);
        } else {
          if (in_inventory(thing) || in_location(thing)) {
            var desc = get_description(state.things, get_first_of_type(words, 'things'));
            echo(desc);
          } else {
            this.standard_error(command);
          }

        }
        
      } else {// I give up...
        this.standard_error(command);
      }
    }
    return '';
  },

move: function(direction) {
  var location = locations[state.location];
  if (location.connections[direction] !== undefined) {
    var new_location = location.connections[direction];
    set_location(new_location);
  } else {
    echo(MESSAGE.error_movement.format(direction),'red');
  }
},

get_item: function(item) {
  if (in_location(item)) {    
    echo(get_description(things, item));
    if (!is_portable(item)) {
      echo(MESSAGE.error_portable.format(item),'red');
    } else {
      add_to_inventory(item);
      remove_item_from_location(state.location, item);
    }
  } else {
    echo(MESSAGE.error_get.format(item),'red');
  }
},

standard_error: function(command) {
  echo(MESSAGE.error.format(command), 'red');
},

/**
 * Checks a command for equality and for synonyms.
 */
check: function(input, to_check) {
  if (input==to_check) {
    return true;
  }
  if (synonyms[to_check]!=undefined) {
    if (synonyms[to_check].indexOf(input)!=-1) {
      return true;
    }
  }
  return false;

}



}