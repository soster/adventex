/**
 * Interpret commands.
 */
'use strict';
var advntx = (function (my) {
  var help_string = undefined;



my.interpreter = {
  interpret: function (command, describe_location_echo, add_to_inventory_echo, echo) {
    var original = command;
    this.echo = echo;
    this.describe_location_echo = describe_location_echo;
    this.add_to_inventory_echo = add_to_inventory_echo;

    command = command.toLowerCase();

    if (isEmpty(command)) {
      return;
    }

    if (command == 'help') {
      echo(this.build_help_string());
    } else if (command == 'debug' && advntx.config.debug) {
      echo(JSON.stringify(advntx.state));
    } else {
      var words = advntx.parser.parse(command);
      var first_verb = advntx.get_first_of_type(words, 'verbs');
      var last_verb = advntx.get_last_of_type(words, 'verbs');
      var preposition = advntx.get_first_of_type(words, 'prepositions');
      var objects = words['objects'];
      var misc = words['misc'];
      var found_nothing = false;

      var item_ids_from_location = advntx.locationhandler.find_item_ids_for_names_in_location(objects,advntx.state.locations[advntx.state.location]);
      var item_ids_from_inventory = advntx.inventoryhandler.find_item_ids_in_inventory(objects);
      var item_ids = [];

      
      var item_ids = item_ids_from_location.concat(item_ids_from_inventory);


      if (advntx.check_synonyms('go', first_verb)) {
        var direction = advntx.get_first_of_type(words, 'directions');
        this.move(direction, item_ids_from_location);
      } else if (advntx.check_synonyms('take', first_verb)) {
        this.get_item(objects, item_ids_from_location);
      } else if (advntx.check_synonyms('examine', first_verb)) {
        this.examine(objects, item_ids);
      } else if (advntx.check_synonyms('drop', first_verb)) {
        this.drop(objects, item_ids_from_inventory);
      }else {// I give up...
        found_nothing = true;
      }


      var event = advntx.eventhandler.find_event(advntx.state.location, item_ids, first_verb, preposition);
      if (event !== undefined) {
        this.trigger_event(event);
        found_nothing = false;
      } else if (found_nothing) {
        if (!isEmpty(first_verb) && objects.length>0) {
          var item_id = item_ids[0];
          echo(advntx.messages.error_verb_object.format(first_verb,advntx.inventoryhandler.get_name_definitive(item_id)), 'red');
        } else {
          this.standard_error(command);
        }
        
      }

      if (!found_nothing) {
        advntx.state.steps++;
      }

    }
  },



  move: function (direction, item_ids) {
    if (isEmpty(direction)) {
      if (item_ids.length>0) {
        var item_id = item_ids[0];
          my.interpreter.echo(advntx.messages.error_movement_thing.format(advntx.inventoryhandler.get_name_definitive(item_id)), 'coral');
          return;
      }
      my.interpreter.echo(advntx.messages.error_movement, 'red');
      return;
    }
    var location = advntx.state.locations[advntx.state.location];
    if (location.connections[direction] !== undefined) {
      var new_location = location.connections[direction];
      advntx.locationhandler.set_location(new_location);
      my.interpreter.describe_location_echo(new_location);
    } else {
      my.interpreter.echo(advntx.messages.error_movement.format(direction), 'red');
    }
  },

  get_item: function (objects, item_ids) {
    if (item_ids.length==0&&objects.length>0) {
      this.echo(advntx.messages.error_specific_get.format(objects[0]), 'red')
    } else if (objects.length==0){
      this.echo(advntx.messages.error_specific_get.format('this'), 'red');
    }
    for (var i=0;i<item_ids.length;i++) {
      var item_id = item_ids[i];
      if (!advntx.inventoryhandler.is_portable(item_id)) {
        var portable_error = advntx.inventoryhandler.get_portable_error(item_id);
        if (!isEmpty(portable_error)) {
          this.echo(portable_error, 'coral');
        } else {
          var indevname = advntx.inventoryhandler.get_name_indefinitive(item_id);
          this.echo(advntx.messages.error_portable.format(indevname), 'coral');
        }

      } else {
        this.echo(advntx.messages.info_you_took.format(advntx.inventoryhandler.get_name_definitive(item_id)));
        this.add_to_inventory_echo(item_id);
        advntx.locationhandler.remove_item_from_location(advntx.state.location, item_id);
      }
    }
  },

  examine: function (objects, item_ids) {
    if (objects.length==0) {
      this.describe_location_echo(advntx.state.location,true);
    } else {
      var item_id = item_ids[0];
      if (!isEmpty(item_id)) {
        var desc = advntx.get_description(advntx.state.objects, item_id);
        this.echo(desc);
      } else if (!isEmpty(item)) {
        this.echo(advntx.messages.error_thing.format(item), 'red');
      } else {
        this.standard_error(command);
      }
    }
  },

  drop: function (objects, item_ids) {
    if (item_ids.length==0&&objects.length>0) {
      this.echo(advntx.messages.error_specific_get.format(objects[0]))
    } else if (objects.length==0){
      this.echo(advntx.messages.error_specific_get.format('this'));
    }

    for (var i=0;i<item_ids.length;i++) {
      var item_id = item_ids[i];
      if (isEmpty(item_id)) {
        this.echo(advntx.messages.error_thing.format(item), 'red');
        break;
      } else {
        advntx.inventoryhandler.remove_from_inventory(item_id);
        advntx.locationhandler.add_item_to_location(advntx.state.location, item_id);
        this.echo(advntx.messages.info_you_dropped.format(advntx.inventoryhandler.get_name_definitive(item_id)));
      }
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
    this.echo(advntx.messages.error.format(command), 'red');
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

  },

  build_help_string: function() {
    if (this.help_string!=undefined) return;
    var verb_string = "";
    for (var i=0;i<advntx.vocabulary.verbs.length;i++) {
      if (i!=0)
        verb_string+=", ";
      verb_string+=advntx.vocabulary.verbs[i];
    }
    help_string = advntx.messages.help.format(verb_string);
    return help_string;
  }

}
return my;
}(advntx || {}));