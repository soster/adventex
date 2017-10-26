/**
 * Interpret commands.
 */
'use strict';
var advntx = (function (my) {
my.interpreter = {
  interpret: function (command, describe_location_echo, add_to_inventory_echo, echo) {
    var original = command;
    this.echo = echo;
    this.describe_location_echo = describe_location_echo;
    this.add_to_inventory_echo = add_to_inventory_echo;

    command = command.toLowerCase();
    if (command == 'help') {
      echo(MESSAGE.help);
    } else if (command == 'debug' && advntx.config.debug) {
      echo(JSON.stringify(advntx.state));
    } else {
      var words = parser.parse(command);
      var first_verb = advntx.get_first_of_type(words, 'verbs');
      var last_verb = advntx.get_last_of_type(words, 'verbs');
      var first_misc = advntx.get_first_of_type(words, 'misc');
      var second_misc = advntx.get_second_of_type(words, 'misc');
      // most important misc word, example 'take red door' -> door is last misc.
      var last_misc = advntx.get_last_of_type(words, 'misc');
      var preposition = advntx.get_first_of_type(words, 'prepositions');

      var found_nothing = false;
      if (advntx.check_synonyms('go', first_verb)) {
        var direction = advntx.get_first_of_type(words, 'directions');
        this.move(direction, last_misc, first_misc);
      } else if (advntx.check_synonyms('take', first_verb)) {
        this.get_item(last_misc, first_misc);
      } else if (advntx.check_synonyms('examine', first_verb)) {
        this.examine(last_misc, first_misc);
      } else if (advntx.check_synonyms('drop', first_verb)) {
        this.drop(last_misc);
      }else {// I give up...
        found_nothing = true;
      }
      var event = advntx.eventhandler.find_event(advntx.state.location, first_misc, second_misc, '', '', first_verb, preposition);
      if (event !== undefined) {
        this.trigger_event(event);
        advntx.state.steps++;
      } else if (found_nothing) {
        if (advntx.check_synonyms('open', first_verb) && !isEmpty(last_misc)) {
          var item_id = advntx.locationhandler.find_item_id_for_names(last_misc, first_misc);
          echo(MESSAGE.error_open.format(advntx.inventoryhandler.get_name_definitive(item_id)));
        } else {
          this.standard_error(command);
        }
        
      } else {
        advntx.state.steps++;
      }

    }
    return '';
  },


  move: function (direction, last_misc, first_misc) {
    if (isEmpty(direction)) {
      if (!isEmpty(last_misc)) {
        var item_id = advntx.locationhandler.find_item_id_for_names(last_misc, first_misc);
        if (!isEmpty(item_id)) {
          my.interpreter.echo(MESSAGE.error_movement_thing.format(advntx.inventoryhandler.get_name_definitive(item_id)), 'coral');
          return;
        }
      }
      my.interpreter.echo(MESSAGE.error_movement.format(last_misc), 'red');
      return;
    }
    var location = advntx.state.locations[advntx.state.location];
    if (location.connections[direction] !== undefined) {
      var new_location = location.connections[direction];
      advntx.locationhandler.set_location(new_location);
      my.interpreter.describe_location_echo(new_location);
    } else {
      my.interpreter.echo(MESSAGE.error_movement.format(direction), 'red');
    }
  },

  get_item: function (item, first_misc) {
    var item_id = advntx.locationhandler.find_item_id_for_names(item, first_misc);

    if (!isEmpty(item_id)) {
      
      if (!advntx.inventoryhandler.is_portable(item_id)) {
        var portable_error = advntx.inventoryhandler.get_portable_error(item_id);
        if (!isEmpty(portable_error)) {
          this.echo(portable_error, 'coral');
        } else {
          var indevname = advntx.inventoryhandler.get_name_indefinitive(item_id);
          this.echo(MESSAGE.error_portable.format(indevname), 'coral');
        }

      } else {
        this.echo(MESSAGE.info_you_took.format(advntx.inventoryhandler.get_name_definitive(item_id)));
        this.add_to_inventory_echo(item_id);
        advntx.locationhandler.remove_item_from_location(advntx.state.location, item_id);
      }
    } else {
      var item_id = advntx.inventoryhandler.find_item_id_for_name_anywhere(item, first_misc);

      if (!isEmpty(item_id)) {
        this.echo(MESSAGE.error_specific_get.format(advntx.inventoryhandler.get_name_definitive(item_id)));
      } else {
        this.echo(MESSAGE.error_get.format(item), 'red');
      }
      
    }
  },

  examine: function (item, first_misc) {
    if (isEmpty(item)) {
      this.describe_location_echo(advntx.state.location);
    } else {
      var item_id = advntx.locationhandler.find_item_id_for_names(item, first_misc);
      if (isEmpty(item_id)) {
        item_id = advntx.inventoryhandler.find_item_id_for_name(item);
      }
      if (!isEmpty(item_id)) {
        var desc = advntx.get_description(advntx.state.things, item_id);
        this.echo(desc);
      } else if (!isEmpty(item)) {
        this.echo(MESSAGE.error_thing.format(item), 'red');
      } else {
        this.standard_error(command);
      }
    }
  },

  drop: function (item) {
    var item_id = advntx.inventoryhandler.find_item_id_for_name(item);
    if (isEmpty(item_id)) {
      this.echo(MESSAGE.error_thing.format(item), 'red');
    } else {
      advntx.inventoryhandler.remove_from_inventory(item_id);
      advntx.locationhandler.add_item_to_location(advntx.state.location, item_id);
      this.echo(MESSAGE.info_you_dropped.format(advntx.inventoryhandler.get_name_definitive(item_id)));
    }
  },

  trigger_event: function (event) {
    var old_location = advntx.state.location;

    advntx.eventhandler.execute_event(event);
    my.interpreter.echo(event.description + '\n');

    if (old_location != advntx.state.location) {
      setTimeout(function () {
        my.interpreter.describe_location_echo(advntx.state.location)
      }, advntx.config.standard_wait_eventtext);
    }


  },

  standard_error: function (command) {
    this.echo(MESSAGE.error.format(command), 'red');
  },

  /**
   * Checks a command for equality and for synonyms.
   */
  check: function (input, to_check) {
    if (input == to_check) {
      return true;
    }
    if (vocabulary.synonyms[to_check] != undefined) {
      if (vocabulary.synonyms[to_check].indexOf(input) != -1) {
        return true;
      }
    }
    return false;

  }

}
return my;
}(advntx || {}));