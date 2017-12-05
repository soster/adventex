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
  getName,
  listFormattedObjects,
  getObjectIdsForState
} from 'app/scripts/helper.js'

export default class Interpreter {
  constructor(advntx) {
    this.advntx = advntx;
    this.helpString = undefined;
    this.textColor = advntx.config.text_color;
    this.errorColor = advntx.config.error_color;
    this.warnColor = advntx.config.warn_color;
    this.previousObject = undefined;
  }



  interpret(command, describeLocationEcho, initInventory, echo, initGame, load, save, listSaveGames) {
    var original = command;
    this.echo = echo;
    this.describeLocationEcho = describeLocationEcho;
    this.initInventory = initInventory;
    this.initGame = initGame;
    this.load = load;
    this.save = save;
    this.listSaveGames = listSaveGames;

    // lower case and remove backslash from auto suggest:
    command = command.toLowerCase().replace('\\', '').trim();

    if (isEmpty(command)) {
      return;
    }
    var words = this.advntx.parser.parse(command);
    var firstVerb = getFirstOfType(words, 'verbs');
    var firstObject = getFirstOfType(words, 'objects');
    var lastVerb = getLastOfType(words, 'verbs');
    var preposition = getFirstOfType(words, 'prepositions');

    //sometimes we need just the second word of the command without distinguishing between objects / verbs and so on:
    var secondWord = this.getSecondWord(command)
    var objects = words['objects'];
    var misc = words['misc'];
    var firstMisc = getFirstOfType(words, 'misc');
    var foundNothing = false;

    var itemIdsFromLocation = this.advntx.locationHandler.findItemIdsInLocation(objects, this.advntx.state.locations[this.advntx.state.location]);
    var itemIdsFromInventory = this.advntx.inventoryHandler.findItemIdsInInventory(objects);
    var itemIds = [];

    var itemIds = itemIdsFromLocation.concat(itemIdsFromInventory);
    var locationObject = this.advntx.state.locations[this.advntx.state.location];

    var executedPreEvents = [];
    var foundEvent = false;

    var firstObject = undefined;
    if (itemIds.length>0) {
      firstObject = itemIds[0];
    }
    var withObject = undefined;
    if (itemIds.length>1 && preposition==advntx.messages.with) {
      withObject = itemIds[1];
    }



    var direction = getFirstOfType(words, 'directions');

    // check if the player entered a direction, then artificially add the verb for 'go'.
    // important: Do this before any event is executed!
    if (isEmpty(firstVerb) && !isEmpty(direction)) {
      firstVerb = advntx.messages.verb_go;
    }

    if (isEmpty(firstVerb) && !isEmpty(firstObject)) {
      firstVerb = advntx.messages.verb_examine;
    }

    // find and execute events BEFORE executing standard verbs:
    var preEvents = this.advntx.eventHandler.findEvents(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);
    var doContinue = true;
    for (var i = 0; i < preEvents.length; i++) {
      var event = preEvents[i];
      if (event.only_after == true) {
        continue;
      }
      doContinue = doContinue & this.triggerEvent(event);
      foundEvent = true;
      executedPreEvents.push(event);
    }



    // check for 'standard' verbs, all other verbs are dealt with in the events.
    if (!foundEvent || doContinue) {
      if (checkSynonyms(advntx.messages.verb_help, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.help(secondWord);
      } else if (checkSynonyms(advntx.messages.verb_go, firstVerb, this.advntx.vocabulary.synonyms)) {
        // go / move
        this.move(direction, itemIdsFromLocation, misc);
      } else if (checkSynonyms(advntx.messages.verb_take, firstVerb, this.advntx.vocabulary.synonyms)) {
        // take/get
        this.getItem(objects, itemIdsFromLocation);
      } else if (checkSynonyms(advntx.messages.verb_examine, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.examine(firstObject);
      } else if (checkSynonyms(advntx.messages.verb_look, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.look(firstObject, preposition);
      } else if (checkSynonyms(advntx.messages.verb_drop, firstVerb, this.advntx.vocabulary.synonyms)) {
        // drop
        this.drop(objects, itemIdsFromInventory);
        
      } else if (checkSynonyms(advntx.messages.verb_open, firstVerb, this.advntx.vocabulary.synonyms) ||
        checkSynonyms(advntx.messages.verb_unlock, firstVerb, this.advntx.vocabulary.synonyms) ||
        checkSynonyms(advntx.messages.verb_lock, firstVerb, this.advntx.vocabulary.synonyms)) {
        // open / unlock (maybe handle unlock differently to open, therefore not in synonyms)
        this.interactWithObjectState(advntx.messages.verb_open,firstObject,withObject);
      } else if (checkSynonyms(advntx.messages.verb_close, firstVerb, this.advntx.vocabulary.synonyms)) {
        // close
        this.interactWithObjectState(advntx.messages.verb_close,firstObject,withObject);  
      } else if (checkSynonyms(advntx.messages.verb_load, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.load(secondWord);
      } else if (checkSynonyms(advntx.messages.verb_save, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.save(secondWord);
      } else if (checkSynonyms(advntx.messages.verb_list, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.listSaveGames();
      } else if (checkSynonyms(advntx.messages.verb_read, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.read(firstObject);
      } else if (checkSynonyms(advntx.messages.verb_restart, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.echo('\n');
        this.initGame(true);
      } else if (checkSynonyms(advntx.messages.verb_inventory, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.echo(listFormattedObjects(advntx.state.inventory, advntx.state.objects, advntx.inventoryHandler));
      }

      else {// I give up... however, there might be an event to execute.
        foundNothing = true;
      }
    }

    this.previousObject = firstObject;

    locationObject = this.advntx.state.locations[this.advntx.state.location];

    // find and execute events AFTER executing standard verbs:
    var postEvents = this.advntx.eventHandler.findEvents(this.advntx.state.location, itemIds, locationObject.objects, firstVerb, preposition, this.advntx.state.events);
    if (doContinue) {
      for (var i = 0; i < postEvents.length; i++) {
        var event = postEvents[i];
        if (executedPreEvents.indexOf(event) != -1 || event.only_before) {
          // event already executed or not suitable
          continue;
        }

        this.triggerEvent(event);
        foundEvent = true;
      }
    }


    if (!foundEvent && foundNothing && !isEmpty(firstVerb) && objects.length > 0) {
      var itemId = itemIds[0];
      var obj = this.advntx.state.objects[itemId];

      if (obj != undefined && obj.custom_errors != undefined) {
        var error = obj.custom_errors;
        var errorMessage = error[firstVerb];
        echo(errorMessage, this.warnColor);
      } else {
        var placeholder = ' ';
        if (!isEmpty(preposition)) {
          placeholder = ' ' + preposition + ' ';
        }
        echo(this.advntx.messages.error_verb_object.format(firstVerb, placeholder, this.advntx.inventoryHandler.getNameWithArticle(itemId)), this.errorColor);
      }
    } else if (foundNothing && !foundEvent) {
      if (!isEmpty(firstVerb)) {
        this.echo(this.advntx.messages.error_verb.format(firstVerb), this.warnColor);
      } else {
        this.standardError(command);
      }
    }

    var allEvents = preEvents.concat(postEvents);
    if (this.checkWinningCondition(allEvents)) {
      echo(this.advntx.messages.info_you_win.format(this.advntx.state.steps, this.advntx.state.points), advntx.config.win_color);
    }


    if (!foundNothing || foundEvent) {
      this.advntx.state.steps++;
      this.initInventory();
    }


  }

  getSecondWord(command) {
    var ws = command.split(' ');
    var name = '';
    if (ws.length > 1) {
      name = ws[1];
    }
    return name;
  }

  help(secondWord) {
    this.echo(this.advntx.messages.verb_help,undefined,'headline');
    if (secondWord != undefined) {
      if (secondWord == 'verbs') {
        this.echo(this.buildVocabularyHelpString(advntx.messages.help_verbs, advntx.vocabulary.verbs));
        return;
      } else if (advntx.messages['help_' + secondWord] != undefined) {
        this.echo(advntx.messages['help_' + secondWord]);
        return;
      }
    }
    // otherwise:
    this.echo(this.advntx.messages.help);
  }


  read(firstObjectId) {
    if (!isEmpty(firstObjectId)) {
      var obj = this.advntx.state.objects[firstObjectId];
      var read = this.advntx.inventoryHandler.getReadOfState(firstObjectId,obj.state);
      if (isEmpty(read)) {
        read = obj.read;
      }

      if (!isEmpty(read)) {
        this.echo(read);
      } else {
        this.echo(advntx.messages.error_read);
      }
    }
  }

  // open/unlock and close
  interactWithObjectState(verb,firstObjectId, withObjectId) {
    var state = '';
    if (verb==this.advntx.messages.verb_open) {
      state = this.advntx.messages.state_open;
    } else if (verb==this.advntx.messages.verb_close) {
      state = this.advntx.messages.state_closed;
    } else if (verb==this.advntx.messages.verb_unlock) {
      state = this.advntx.messages.state_open;
    } else if (verb==this.advntx.messages.verb_lock) {
      state = this.advntx.messages.state_close;
    }


    if (isEmpty(firstObjectId) && !isEmpty(this.previousObject)) {
      firstObjectId = this.previousObject;
    }

    if (isEmpty(firstObjectId)) {
      this.echo(this.advntx.messages.error_generic_open_close.format(verb),this.advntx.config.warn_color);
      return;
    }
    if (this.advntx.inventoryHandler.hasState(firstObjectId, state)) {
      var needed;
      if (state==this.advntx.messages.state_open && this.advntx.inventoryHandler.isLocked(firstObjectId)) {
        needed = this.advntx.inventoryHandler.getLockUnlockItem(firstObjectId);
      } else {
        needed = this.advntx.inventoryHandler.needItemForState(firstObjectId, state);
      }

      if (needed===undefined||needed==withObjectId) {
        this.advntx.inventoryHandler.setState(firstObjectId,state);

        if (state==this.advntx.messages.state_open && withObjectId!==undefined){
          // unlock
          this.advntx.inventoryHandler.lock(firstObjectId, false);
        }

        if (state==this.advntx.messages.state_closed && withObjectId==this.advntx.inventoryHandler.getLockUnlockItem(firstObjectId)) {
          // lock
          this.advntx.inventoryHandler.lock(firstObjectId, true);
        }

        var text = advntx.inventoryHandler.getDescriptionOfState(firstObjectId, state);
        if (text===undefined) {
          text = advntx.messages.info_success;
        }
        this.echo(text);

        var objects = advntx.state.objects[firstObjectId].states[state].objects;
        if (objects!==undefined&&objects.length>0) {
          this.echo(advntx.messages.info_you_see);
          this.echo(listFormattedObjects(objects, advntx.state.objects, advntx.inventoryHandler));
        }
        
      } else {
        var error = this.advntx.inventoryHandler.getErrorOfState(firstObjectId, state);
        if (isEmpty(error)) {
          error = this.advntx.messages.error_verb_object.format(verb+' ',getName(this.advntx.state.objects,firstObjectId),'');
        }
        this.echo(error,this.advntx.config.warn_color);
      }
    } else {
      this.echo(this.advntx.messages.error_verb_object.format(verb+' ',getName(this.advntx.state.objects,firstObjectId),' '),this.advntx.config.warn_color);
    }
  }


  move(direction, item_ids, misc) {
    var new_location = undefined;
    if (isEmpty(direction)) {
      if (item_ids.length > 0) {
        var item_id = item_ids[0];
        this.advntx.interpreter.echo(this.advntx.messages.error_movement_thing.format(this.advntx.inventoryHandler.getNameWithArticle(item_id)), this.warnColor);
        return;
      }
      if (this.advntx.config.debug && misc.length > 0) {
        var loc = this.advntx.state.locations[misc[0]];
        if (loc != undefined) {
          new_location = misc[0];
        }
      }
      if (new_location == undefined) {
        this.advntx.interpreter.echo(this.advntx.messages.error_movement, this.errorColor);
        return;
      }
    }
    var location = this.advntx.state.locations[this.advntx.state.location];

    if (new_location == undefined) {
      new_location = this.advntx.locationHandler.findConnectionsForDirection(location, direction);
    }

    if (new_location != undefined) {
      this.advntx.locationHandler.setLocation(new_location);
      this.advntx.interpreter.describeLocationEcho(new_location, false);
    } else {
      this.advntx.interpreter.echo(this.advntx.messages.error_movement_direction.format(direction), this.errorColor);
    }
  }

  getItem(objects, item_ids) {
    if (item_ids.length == 0 && objects.length > 0) {
      this.echo(this.advntx.messages.error_specific_get.format(objects[0]), this.errorColor)
    } else if (objects.length == 0) {
      this.echo(this.advntx.messages.error_specific_get.format('this'), this.errorColor);
    }
    for (var i = 0; i < item_ids.length; i++) {
      var item_id = item_ids[i];
      if (!this.advntx.inventoryHandler.isPortable(item_id)) {
        var portable_error = this.advntx.inventoryHandler.getPortableError(item_id);
        if (!isEmpty(portable_error)) {
          this.echo(portable_error, this.warnColor);
        } else {
          var indevname = this.advntx.inventoryHandler.getNameWithArticle(item_id);
          this.echo(this.advntx.messages.error_portable.format(indevname), this.warnColor);
        }

      } else {
        this.echo(this.advntx.messages.info_you_took.format(this.advntx.inventoryHandler.getNameWithArticle(item_id)));
        this.advntx.inventoryHandler.addToInventory(item_id);
        this.initInventory();
        this.advntx.locationHandler.removeItemFromLocation(this.advntx.state.location, item_id);
      }
    }
  }

  examine(firstObject) {
    if (firstObject===undefined) {
      this.echo(advntx.messages.error_examine, this.errorColor);
      return;
    }

    var desc = getDescription(this.advntx.state.objects, firstObject);
    this.echo(desc);
  }

  look(firstObject, preposition) {
    if (isEmpty(firstObject) && (isEmpty(preposition) || preposition==advntx.messages.preposition_around)) {
      this.describeLocationEcho(this.advntx.state.location, true);
    } else {
      if (isEmpty(firstObject) && !isEmpty(preposition)  && !isEmpty(this.previousObject)) {
        firstObject = this.previousObject;
      }

      if (!isEmpty(firstObject) && preposition==this.advntx.messages.preposition_at) {
        var desc = getDescription(this.advntx.state.objects, firstObject);
        this.echo(desc);
      } else if (!isEmpty(firstObject) && preposition==this.advntx.messages.preposition_inside) {
        var object = advntx.state.objects[firstObject];
        if (object.state!==undefined && object.state!='none') {
          var ids = getObjectIdsForState(object.states[object.state]);
          var objectsMessage = listFormattedObjects(ids, advntx.state.objects, advntx.inventoryHandler);
          this.echo(advntx.messages.info_inside_you_see.format(advntx.inventoryHandler.getNameWithArticle(firstObject)));
          this.echo(objectsMessage);
        }
        
      } else {
        this.echo(advntx.messages.error_look);
      }
    }
  }

  drop(objects, item_ids) {
    if (item_ids.length == 0 && objects.length > 0) {
      this.echo(this.advntx.messages.error_specific_get.format(objects[0]))
    } else if (objects.length == 0) {
      this.echo(this.advntx.messages.error_specific_get.format('this'));
    }

    for (var i = 0; i < item_ids.length; i++) {
      var item_id = item_ids[i];
      if (isEmpty(item_id)) {
        this.echo(this.advntx.messages.error_thing.format(item), this.errorColor);
        break;
      } else {
        this.advntx.inventoryHandler.removeFromInventory(item_id);
        this.advntx.locationHandler.addItemToLocation(this.advntx.state.location, item_id);
        this.echo(this.advntx.messages.info_you_dropped.format(this.advntx.inventoryHandler.getNameWithArticle(item_id)));
      }
    }


  }

  triggerEvent(event) {
    var old_location = this.advntx.state.location;

    var doContinue = this.advntx.eventHandler.executeEvent(event, this.advntx.interpreter.echo);

    if (old_location != this.advntx.state.location) {
      setTimeout(function () {
        this.advntx.interpreter.describeLocationEcho(this.advntx.state.location, false)
      }, this.advntx.config.standard_wait_eventtext);
    }

    return doContinue;
  }


  standardError(command) {
    this.echo(this.advntx.messages.error.format(command), this.errorColor);
  }

  /**
   * Checks a command for equality and for synonyms.
   */
  check(input, to_check) {
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

  buildVocabularyHelpString(helpString, vocabularyObjects) {
    var vocabString = '';
    for (var i = 0; i < vocabularyObjects.length; i++) {
      if (i != 0)
        vocabString += ', ';
      vocabString += vocabularyObjects[i];
    }
    var string = helpString.format(vocabString);
    return string;
  }


  checkWinningCondition(events) {
    for (var i = 0; i < events.length; i++) {
      if (this.advntx.state.events['win_event'] === events[i]) {
        return true;
      }
    }
    return false;
  }

}

