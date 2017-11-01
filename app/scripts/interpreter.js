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
      var firstVerb = advntx.get_first_of_type(words, 'verbs');
      var lastVerb = advntx.get_last_of_type(words, 'verbs');
      var preposition = advntx.get_first_of_type(words, 'prepositions');
      var objects = words['objects'];
      var misc = words['misc'];
      var foundNothing = false;

      var itemIdsFromLocation = advntx.locationhandler.find_item_ids_in_location(objects,advntx.state.locations[advntx.state.location]);
      var itemIdsFromInventory = advntx.inventoryhandler.find_item_ids_in_inventory(objects);
      var itemIds = [];

      
      var itemIds = itemIdsFromLocation.concat(itemIdsFromInventory);
      var locationObject = advntx.state.locations[advntx.state.location];
      
      var preEvents = advntx.eventhandler.find_events(advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, advntx.state.events);
      var executedPreEvents = [];
      var foundEvent = false;

      var doContinue = true;
      for (var i=0;i<preEvents.length;i++) {
        var event = preEvents[i];
        if (event.prereq_only_after == true) {
          continue;
        }
        doContinue = doContinue & this.trigger_event(event);
        foundEvent = true;
        executedPreEvents.push(event);
      }


      if (!foundEvent || doContinue) {
        if (advntx.check_synonyms('go', firstVerb)) {
          var direction = advntx.get_first_of_type(words, 'directions');
          this.move(direction, itemIdsFromLocation);
        } else if (advntx.check_synonyms('take', firstVerb)) {
          this.get_item(objects, itemIdsFromLocation);
        } else if (advntx.check_synonyms('examine', firstVerb)) {
          this.examine(objects, itemIds);
        } else if (advntx.check_synonyms('drop', firstVerb)) {
          this.drop(objects, itemIdsFromInventory);
        } else {// I give up...
          foundNothing = true;
        }
      }
      
      locationObject = advntx.state.locations[advntx.state.location];
      var postEvents = advntx.eventhandler.find_events(advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, advntx.state.events);

      if (doContinue) {
        for (var i=0;i<postEvents.length;i++) {
          var event = postEvents[i];
          if (executedPreEvents.indexOf(event)!=-1 || event.prereq_only_before) {
            // event already executed or not suitable
            continue;
          }
          
          this.trigger_event(event);
          foundEvent = true;
        }
      }


      if (!foundEvent && foundNothing && !isEmpty(firstVerb) && objects.length>0) {
        var itemId = itemIds[0];
        var obj = advntx.state.objects[itemId];
        
        var error = obj.custom_errors;
        if (error!=undefined) {
          var errorMessage = error[firstVerb];
          echo(errorMessage, 'coral');
        } else {
          echo(advntx.messages.error_verb_object.format(firstVerb,advntx.inventoryhandler.get_name_definitive(itemId)), 'red');
        }
      } else if (foundNothing && !foundEvent) {
          this.standard_error(command); 
      }

      var allEvents = preEvents.concat(postEvents);
      if (this.check_winning_condition(allEvents)) {
        echo(advntx.messages.info_you_win.format(advntx.state.steps,advntx.state.points),'yellow');
      }


      if (!foundNothing || foundEvent) {
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
      my.interpreter.describe_location_echo(new_location, false);
    } else {
      my.interpreter.echo(advntx.messages.error_movement_direction.format(direction), 'red');
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
      var object = objects[0];
      if (!isEmpty(item_id)) {
        var desc = advntx.get_description(advntx.state.objects, item_id);
        this.echo(desc);
      } else if (!isEmpty(object)) {
        this.echo(advntx.messages.error_thing.format(object), 'red');
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

    var doContinue = advntx.eventhandler.execute_event(event,my.interpreter.echo);

    if (old_location != advntx.state.location) {
      setTimeout(function () {
        my.interpreter.describe_location_echo(advntx.state.location, false)
      }, advntx.config.standard_wait_eventtext);
    }

    return doContinue;
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
    var verbString = '';
    for (var i=0;i<advntx.vocabulary.verbs.length;i++) {
      if (i!=0)
        verbString+=', ';
      verbString+=advntx.vocabulary.verbs[i];
    }
    help_string = advntx.messages.help.format(verbString);
    return help_string;
  },

  check_winning_condition: function(events) {
    for (var i=0;i<events.length;i++) {
      if (advntx.state.events['win_event']===events[i]) {
        return true;
      }
    }
    return false;
  }

}
return my;
}(advntx || {}));