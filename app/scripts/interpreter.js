var Interpreter = {
  interpret: function (command, set_location, add_to_inventory, echo) {
    var original = command;
    command = command.toLowerCase();
    if (command == 'help') {
      echo(MESSAGE.help);
    } else if (command == 'debug' && CONFIG.debug) {
      echo(JSON.stringify(state));
    } else {
      var words = parser.parse(command);
      if (get_first_of_type(words,'verbs')=='go') {
        var direction = get_first_of_type(words, 'directions');
        this.move(direction);
      } else if (get_first_of_type(words,'verbs')=='take') {
        var thing = get_first_of_type(words, 'things');
        this.get_item(thing);
      } else if (get_first_of_type(words,'verbs')=='examine') {
        var thing = get_first_of_type(words, 'things');
        if (thing=='') {
          echo(MESSAGE.error.format(command),'red');
        } else {
          var desc = get_description(things, get_first_of_type(words, 'things'));
          echo(desc);
        }
        
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
  var location = locations[state.location];
  if (location.things.indexOf(item) != -1) {    
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
}



}