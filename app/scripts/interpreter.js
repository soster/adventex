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
    this.helpString = undefined;
    this.textColor = advntx.config.text_color;
    this.errorColor = advntx.config.error_color;
    this.warnColor = advntx.config.warn_color;
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
      // help
      if (checkSynonyms(advntx.messages.verb_help, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.help(secondWord);
        // go
      } else if (checkSynonyms(advntx.messages.verb_go, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.move(direction, itemIdsFromLocation, misc);
        // take
      } else if (checkSynonyms(advntx.messages.verb_take, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.getItem(objects, itemIdsFromLocation);
        // examine
      } else if (checkSynonyms(advntx.messages.verb_examine, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.examine(objects, itemIds);
        // drop
      } else if (checkSynonyms(advntx.messages.verb_drop, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.drop(objects, itemIdsFromInventory);
        // restart
      } else if (checkSynonyms(advntx.messages.verb_restart, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.echo('\n');
        this.initGame(true);
      } else if (checkSynonyms(advntx.messages.verb_load, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.load(secondWord);
      } else if (checkSynonyms(advntx.messages.verb_save, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.save(secondWord);
      } else if (checkSynonyms(advntx.messages.verb_list, firstVerb, this.advntx.vocabulary.synonyms)) {
        this.listSaveGames();
      }

      else {// I give up... however, there might be an event to execute.
        foundNothing = true;
      }
    }

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
        echo(this.advntx.messages.error_verb_object.format(firstVerb, placeholder, this.advntx.inventoryHandler.getNameDefinitive(itemId)), this.errorColor);
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

  move(direction, item_ids, misc) {
    var new_location = undefined;
    if (isEmpty(direction)) {
      if (item_ids.length > 0) {
        var item_id = item_ids[0];
        this.advntx.interpreter.echo(this.advntx.messages.error_movement_thing.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)), this.warnColor);
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
          var indevname = this.advntx.inventoryHandler.getNameIndefinitive(item_id);
          this.echo(this.advntx.messages.error_portable.format(indevname), this.warnColor);
        }

      } else {
        this.echo(this.advntx.messages.info_you_took.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)));
        this.advntx.inventoryHandler.addToInventory(item_id);
        this.initInventory();
        this.advntx.locationHandler.removeItemFromLocation(this.advntx.state.location, item_id);
      }
    }
  }

  examine(objects, item_ids) {
    if (objects.length == 0) {
      this.describeLocationEcho(this.advntx.state.location, true);
    } else {
      var item_id = item_ids[0];
      var object = objects[0];
      if (!isEmpty(item_id)) {
        var desc = getDescription(this.advntx.state.objects, item_id);
        this.echo(desc);
      } else if (!isEmpty(object)) {
        this.echo(this.advntx.messages.error_thing.format(object), this.errorColor);
      } else {
        this.standardError(command);
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
        this.echo(this.advntx.messages.info_you_dropped.format(this.advntx.inventoryHandler.getNameDefinitive(item_id)));
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

