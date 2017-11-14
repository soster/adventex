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



  interpret (command, describeLocationEcho, init_inventory, echo, init_game) {
    var original = command;
    this.echo = echo;
    this.describeLocationEcho = describeLocationEcho;
    this.init_inventory = init_inventory;
    this.init_game = init_game;

    // lower case and remove backslash from auto suggest:
    command = command.toLowerCase().replace('\\','');

    if (isEmpty(command)) {
      return;
    }

    if (command == 'help') {
      echo(this.buildHelpString());
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

      var itemIdsFromLocation = this.advntx.locationHandler.findItemIdsInLocation(objects,this.advntx.state.locations[this.advntx.state.location]);
      var itemIdsFromInventory = this.advntx.inventoryHandler.findItemIdsInInventory(objects);
      var itemIds = [];

      
      var itemIds = itemIdsFromLocation.concat(itemIdsFromInventory);
      var locationObject = this.advntx.state.locations[this.advntx.state.location];
      
      var preEvents = this.advntx.eventHandler.findEvents(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);
      var executedPreEvents = [];
      var foundEvent = false;

      var doContinue = true;
      for (var i=0;i<preEvents.length;i++) {
        var event = preEvents[i];
        if (event.prereq_only_after == true) {
          continue;
        }
        doContinue = doContinue & this.triggerEvent(event);
        foundEvent = true;
        executedPreEvents.push(event);
      }


      if (!foundEvent || doContinue) {
        if (checkSynonyms('go', firstVerb, this.advntx.vocabulary.synonyms)) {
          var direction = getFirstOfType(words, 'directions');
          this.move(direction, itemIdsFromLocation, misc);
        } else if (checkSynonyms('take', firstVerb, this.advntx.vocabulary.synonyms)) {
          this.getItem(objects, itemIdsFromLocation);
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
      var postEvents = this.advntx.eventHandler.findEvents(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);

      if (doContinue) {
        for (var i=0;i<postEvents.length;i++) {
          var event = postEvents[i];
          if (executedPreEvents.indexOf(event)!=-1 || event.prereq_only_before) {
            // event already executed or not suitable
            continue;
          }
          
          this.triggerEvent(event);
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
          var placeholder = ' ';
          if (!isEmpty(preposition)) {
            placeholder = ' '+preposition+' ';
          }
          echo(this.advntx.messages.error_verb_object.format(firstVerb,placeholder,this.advntx.inventoryHandler.getNameDefinitive(itemId)), 'red');
        }
      } else if (foundNothing && !foundEvent) {
        if (!isEmpty(firstVerb)) {
          this.echo(this.advntx.messages.error_verb.format(firstVerb), 'coral');
        } else {
          this.standardError(command);
        }
      }

      var allEvents = preEvents.concat(postEvents);
      if (this.checkWinningCondition(allEvents)) {
        echo(this.advntx.messages.info_you_win.format(this.advntx.state.steps,this.advntx.state.points),'yellow');
      }


      if (!foundNothing || foundEvent) {
        this.advntx.state.steps++;
        this.init_inventory();
      }

    }
  }



  move  (direction, item_ids, misc) {
    var new_location = undefined;
    if (isEmpty(direction)) {
      if (item_ids.length>0) {
        var item_id = item_ids[0];
        this.advntx.interpreter.echo(this.advntx.messages.error_movement_thing.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)), 'coral');
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
      new_location = this.advntx.locationHandler.findConnectionsForDirection(location,direction);
    } 

    if (new_location!=undefined) {
      this.advntx.locationHandler.setLocation(new_location);
      this.advntx.interpreter.describeLocationEcho(new_location, false);
    } else {
      this.advntx.interpreter.echo(this.advntx.messages.error_movement_direction.format(direction), 'red');
    }
  }

  getItem (objects, item_ids) {
    if (item_ids.length==0&&objects.length>0) {
      this.echo(this.advntx.messages.error_specific_get.format(objects[0]), 'red')
    } else if (objects.length==0){
      this.echo(this.advntx.messages.error_specific_get.format('this'), 'red');
    }
    for (var i=0;i<item_ids.length;i++) {
      var item_id = item_ids[i];
      if (!this.advntx.inventoryHandler.isPortable(item_id)) {
        var portable_error = this.advntx.inventoryHandler.getPortableError(item_id);
        if (!isEmpty(portable_error)) {
          this.echo(portable_error, 'coral');
        } else {
          var indevname = this.advntx.inventoryHandler.getNameIndefinitive(item_id);
          this.echo(this.advntx.messages.error_portable.format(indevname), 'coral');
        }

      } else {
        this.echo(this.advntx.messages.info_you_took.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)));
        this.advntx.inventoryHandler.addToInventory(item_id);
        this.init_inventory();
        this.advntx.locationHandler.removeItemFromLocation(this.advntx.state.location, item_id);
      }
    }
  }

  examine (objects, item_ids) {
    if (objects.length==0) {
      this.describeLocationEcho(this.advntx.state.location,true);
    } else {
      var item_id = item_ids[0];
      var object = objects[0];
      if (!isEmpty(item_id)) {
        var desc = getDescription(this.advntx.state.objects, item_id);
        this.echo(desc);
      } else if (!isEmpty(object)) {
        this.echo(this.advntx.messages.error_thing.format(object), 'red');
      } else {
        this.standardError(command);
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
        this.advntx.inventoryHandler.removeFromInventory(item_id);
        this.advntx.locationHandler.addItemToLocation(this.advntx.state.location, item_id);
        this.echo(this.advntx.messages.info_you_dropped.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)));
      }
    }
    

  }

  triggerEvent  (event) {
    var old_location = this.advntx.state.location;

    var doContinue = this.advntx.eventHandler.executeEvent(event,this.advntx.interpreter.echo);

    if (old_location != this.advntx.state.location) {
      setTimeout(function () {
        this.advntx.interpreter.describeLocationEcho(this.advntx.state.location, false)
      }, this.advntx.config.standard_wait_eventtext);
    }

    return doContinue;
  }


  standardError  (command) {
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

  buildHelpString() {
    if (this.help_string!=undefined) {
      return this.help_string;
    }
    var verbString = '';
    for (var i=0;i<this.advntx.vocabulary.verbs.length;i++) {
      if (i!=0)
        verbString+=', ';
      verbString+=this.advntx.vocabulary.verbs[i];
    }
    this.help_string = this.advntx.messages.help.format(verbString);
    return this.help_string;
  }

  checkWinningCondition (events) {
    for (var i=0;i<events.length;i++) {
      if (this.advntx.state.events['win_event']===events[i]) {
        return true;
      }
    }
    return false;
  }

}
