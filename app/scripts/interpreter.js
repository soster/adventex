/**
 * Interpret commands.
 */
'use strict';

import {
  checkSynonyms,
  findItemIds,
  getDescription,
  getFirstOfType,
  getLastOfType,
  getName
} from 'app/scripts/helper.js'

export default class Interpreter {
  constructor(advntx) {
    this.advntx = advntx;
    this.help_string = undefined;
  }



  interpret (command, describe_location_echo, init_inventory, echo, init_game) {
    var original = command;
    this.echo = echo;
    this.describe_location_echo = describe_location_echo;
    this.init_inventory = init_inventory;
    this.init_game = init_game;

    command = command.toLowerCase();

    if (isEmpty(command)) {
      return;
    }

    if (command == 'help') {
      echo(this.build_help_string());
    } else if (command == 'debug' && this.advntx.config.debug) {
      echo(JSON.stringify(this.advntx.state));
    } else {
      var words = this.advntx.parser.parse(command);
      var firstVerb = getFirstOfType(words, 'verbs');
      var lastVerb = getLastOfType(words, 'verbs');
      var preposition = getFirstOfType(words, 'prepositions');
      var objects = words['objects'];
      var misc = words['misc'];
      var foundNothing = false;

      var itemIdsFromLocation = this.advntx.locationHandler.find_item_ids_in_location(objects,this.advntx.state.locations[this.advntx.state.location]);
      var itemIdsFromInventory = this.advntx.inventoryHandler.find_item_ids_in_inventory(objects);
      var itemIds = [];

      
      var itemIds = itemIdsFromLocation.concat(itemIdsFromInventory);
      var locationObject = this.advntx.state.locations[this.advntx.state.location];
      
      var preEvents = this.advntx.eventHandler.find_events(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);
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
        if (checkSynonyms('go', firstVerb, this.advntx.vocabulary.synonyms)) {
          var direction = getFirstOfType(words, 'directions');
          this.move(direction, itemIdsFromLocation, misc);
        } else if (checkSynonyms('take', firstVerb, this.advntx.vocabulary.synonyms)) {
          this.get_item(objects, itemIdsFromLocation);
        } else if (checkSynonyms('examine', firstVerb, this.advntx.vocabulary.synonyms)) {
          this.examine(objects, itemIds);
        } else if (checkSynonyms('drop', firstVerb, this.advntx.vocabulary.synonyms)) {
          this.drop(objects, itemIdsFromInventory);
        } else if (checkSynonyms('restart', firstVerb, this.advntx.vocabulary.synonyms)) {
          this.echo('\n');
          this.init_game(true);
        } else {// I give up...
          foundNothing = true;
        }
      }
      
      locationObject = this.advntx.state.locations[this.advntx.state.location];
      var postEvents = this.advntx.eventHandler.find_events(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);

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
        var obj = this.advntx.state.objects[itemId];
           
        if (obj!=undefined&&obj.custom_errors!=undefined) {
          var error = obj.custom_errors;
          var errorMessage = error[firstVerb];
          echo(errorMessage, 'coral');
        } else {
          echo(this.advntx.messages.error_verb_object.format(firstVerb,this.advntx.inventoryHandler.get_name_definitive(itemId)), 'red');
        }
      } else if (foundNothing && !foundEvent) {
          this.standard_error(command); 
      }

      var allEvents = preEvents.concat(postEvents);
      if (this.check_winning_condition(allEvents)) {
        echo(this.advntx.messages.info_you_win.format(this.advntx.state.steps,this.advntx.state.points),'yellow');
      }


      if (!foundNothing || foundEvent) {
        this.advntx.state.steps++;
        this.advntx.init_inventory();
      }

    }
  }



  move  (direction, item_ids, misc) {
    var new_location = undefined;
    if (isEmpty(direction)) {
      if (item_ids.length>0) {
        var item_id = item_ids[0];
        this.advntx.interpreter.echo(this.advntx.messages.error_movement_thing.format(this.advntx.inventoryHandler.get_name_definitive(item_id)), 'coral');
          return;
      } 
      if (this.advntx.config.debug && misc.length>0) {
        var loc = this.advntx.state.locations[misc[0]];
        if (loc!=undefined) {
            new_location = misc[0];
        }
      }
      if (new_location==undefined) {
        this.advntx.interpreter.echo(this.advntx.messages.error_movement, 'red');
        return;
      }
    }
    var location = this.advntx.state.locations[this.advntx.state.location];

    if (new_location==undefined) {
      new_location = this.advntx.locationHandler.find_connection_for_direction(location,direction);
    } 

    if (new_location!=undefined) {
      this.advntx.locationHandler.set_location(new_location);
      this.advntx.interpreter.describe_location_echo(new_location, false);
    } else {
      this.advntx.interpreter.echo(this.advntx.messages.error_movement_direction.format(direction), 'red');
    }
  }

  get_item (objects, item_ids) {
    if (item_ids.length==0&&objects.length>0) {
      this.echo(this.advntx.messages.error_specific_get.format(objects[0]), 'red')
    } else if (objects.length==0){
      this.echo(this.advntx.messages.error_specific_get.format('this'), 'red');
    }
    for (var i=0;i<item_ids.length;i++) {
      var item_id = item_ids[i];
      if (!this.advntx.inventoryHandler.is_portable(item_id)) {
        var portable_error = this.advntx.inventoryHandler.get_portable_error(item_id);
        if (!isEmpty(portable_error)) {
          this.echo(portable_error, 'coral');
        } else {
          var indevname = this.advntx.inventoryHandler.get_name_indefinitive(item_id);
          this.echo(this.advntx.messages.error_portable.format(indevname), 'coral');
        }

      } else {
        this.echo(this.advntx.messages.info_you_took.format(this.advntx.inventoryHandler.get_name_definitive(item_id)));
        this.advntx.inventoryHandler.add_to_inventory(item_id);
        this.advntx.init_inventory();
        this.advntx.locationHandler.remove_item_from_location(this.advntx.state.location, item_id);
      }
    }
  }

  examine (objects, item_ids) {
    if (objects.length==0) {
      this.describe_location_echo(this.advntx.state.location,true);
    } else {
      var item_id = item_ids[0];
      var object = objects[0];
      if (!isEmpty(item_id)) {
        var desc = getDescription(this.advntx.state.objects, item_id);
        this.echo(desc);
      } else if (!isEmpty(object)) {
        this.echo(this.advntx.messages.error_thing.format(object), 'red');
      } else {
        this.standard_error(command);
      }
    }
  }

  drop (objects, item_ids) {
    if (item_ids.length==0&&objects.length>0) {
      this.echo(this.advntx.messages.error_specific_get.format(objects[0]))
    } else if (objects.length==0){
      this.echo(this.advntx.messages.error_specific_get.format('this'));
    }

    for (var i=0;i<item_ids.length;i++) {
      var item_id = item_ids[i];
      if (isEmpty(item_id)) {
        this.echo(this.advntx.messages.error_thing.format(item), 'red');
        break;
      } else {
        this.advntx.inventoryHandler.remove_from_inventory(item_id);
        this.advntx.locationHandler.add_item_to_location(this.advntx.state.location, item_id);
        this.echo(this.advntx.messages.info_you_dropped.format(this.advntx.inventoryHandler.get_name_definitive(item_id)));
      }
    }
    

  }

  trigger_event  (event) {
    var old_location = this.advntx.state.location;

    var doContinue = this.advntx.eventHandler.execute_event(event,this.advntx.interpreter.echo);

    if (old_location != this.advntx.state.location) {
      setTimeout(function () {
        this.advntx.interpreter.describe_location_echo(this.advntx.state.location, false)
      }, this.advntx.config.standard_wait_eventtext);
    }

    return doContinue;
  }


  standard_error  (command) {
    this.echo(this.advntx.messages.error.format(command), 'red');
  }

  /**
   * Checks a command for equality and for synonyms.
   */
  check  (input, to_check) {
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

  build_help_string() {
    if (this.help_string!=undefined) return;
    var verbString = '';
    for (var i=0;i<this.advntx.vocabulary.verbs.length;i++) {
      if (i!=0)
        verbString+=', ';
      verbString+=this.advntx.vocabulary.verbs[i];
    }
    this.help_string = this.advntx.messages.help.format(verbString);
    return this.help_string;
  }

  check_winning_condition (events) {
    for (var i=0;i<events.length;i++) {
      if (this.advntx.state.events['win_event']===events[i]) {
        return true;
      }
    }
    return false;
  }

}
