
import 'bootstrap/css/bootstrap.css!';
import 'jquery.terminal/css/jquery.terminal.min.css!';

import $ from 'jquery';
import terminal from 'jquery.terminal';
import Parser from 'app/scripts/parser.js';
import parseJson from 'app/scripts/json.js';
import {
  checkSynonyms,
  findFirstMatch,
  findItemIds,
  findItemIdsForName,
  getDescription,
  getFirstOfType,
  getLastOfType,
  getName,
  getOfType,
  getProperty,
  getSecondOfType,
  isHidden,
  listFormattedObjects,
  setStateOfObject,
  getObjectNameArray
} from 'app/scripts/helper.js'

import InventoryHandler from 'app/scripts/inventoryhandler.js'
import LocationHandler from 'app/scripts/locationhandler.js'
import EventHandler from 'app/scripts/eventhandler.js'
import Interpreter from 'app/scripts/interpreter.js'




/**
 * Set advntx as global variable. 
 * window is needed because of system.js.
 */
window.advntx = {


  echo (text, color, clazz, bold) {
    if (color!=undefined||clazz!=undefined) {
      if (clazz === undefined) {
        clazz='';
      }
      if (color === undefined) {
        color = '';
      }
      var formatting='';
      if (bold) {
        formatting = 'b';
      }
      text = '[['+formatting+';'+color+';;'+clazz+']'+text+']';
    }
    advntx.term.echo(text,{
      keepWords: true
    });
  },
  
  describeLocationEcho (locationId, alwaysShowFullDescription) {
    var loc = advntx.locationHandler.getLocationById(locationId);
    var name = getName(advntx.state.locations, locationId);
    
    if (!advntx.locationHandler.visited(locationId) || alwaysShowFullDescription) {
      advntx.echo(name, loc.color, 'headline');
      
      var description = advntx.locationHandler.getLocationDescription(locationId);
      // loop through possible directions:
      for (var i=0;i<advntx.vocabulary.directions.length;i++) {
        var direction = advntx.vocabulary.directions[i];
        description = description.replace(direction,'[[!;;;;javascript:advntx.terminalLink(\' '+direction+' \');]'+direction+']');
      }

      advntx.echo(description);
    }
    var prompt = name+'>';
    advntx.term.set_prompt('[[b;;]'+prompt+']');

    var objects = loc.objects;
    var message = advntx.messages.info_you_see;
    var objectsMessage = listFormattedObjects(objects, advntx.state.objects, advntx.inventoryHandler);
    
    
    if (!isEmpty(objectsMessage)) {
      advntx.echo(message);
      advntx.echo(objectsMessage);
    } else {
      advntx.echo(advntx.messages.info_you_see_nothing)
    }
    
  },

  addToInventoryEcho (item) {
    advntx.inventoryHandler.addToInventory(item);
    advntx.initInventory();
  },

  initGame (refreshJson) {
    // version string, add to json calls to avoid browser caching:
    advntx.version = g_ver;
    if (isEmpty(advntx.currentGame)) {
      advntx.currentGame = 'json/escape';
    }

    if (advntx.term!=undefined) {
      advntx.term.clear();
    }
    

    if (refreshJson==true) {
      parseJson(advntx.initGameAsync, advntx);
    } else {
      advntx.initGameAsync(false);
    }
  },

  terminalLink(name) {
    advntx.term.insert(name);
    advntx.asyncRefocusTerminal();
  },

  executeLink(name) {
    advntx.term.exec(name);
    advntx.asyncRefocusTerminal();
  },

  executeCurrent() {
    advntx.term.exec(advntx.term.get_command());
    advntx.term.set_command('');
    advntx.asyncRefocusTerminal();
  },

  load(name) {
    var retrievedObject = localStorage.getItem('advntx'+name);
    if (retrievedObject != undefined) {
      advntx.state = JSON.parse(retrievedObject);
      advntx.echo(advntx.messages.info_game_loaded.format(name));
      advntx.term.exec('clear');
      advntx.initGame(false);
    }
  },

  save(name) {
    localStorage.setItem('advntx'+name, JSON.stringify(advntx.state));
    advntx.echo(advntx.messages.info_game_saved.format(name));
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  },

  listSavegames() {
    for(var i in localStorage)
    {
        if (i.startsWith('advntx')) {
          var name = i.replace('advntx','');
          var link = name;
          if (isEmpty(name)) {
            name = 'default';
          }
          advntx.echo('[[!;;;;javascript:advntx.terminalLink(\'load '+link+'\');]'+name+']');
        }  
    }
  },

  initGameAsync (reset) {

    if (advntx.term===undefined) {
    advntx.term = $('#terminal').terminal(function (command) {
      var echo = advntx.echo;
      advntx.interpreter.interpret(command, advntx.describeLocationEcho, advntx.initInventory, advntx.echo, advntx.initGame, advntx.load, advntx.save, advntx.listSavegames);
    }, {
        greetings: '',
        name: advntx.messages.name,
        prompt: advntx.config.console.prompt,
        height: advntx.config.console.height,
        completion: advntx.vocabulary.verbs.concat(advntx.vocabulary.directions).concat(advntx.vocabulary.prepositions).concat(getObjectNameArray(advntx.state.objects))
      });
    }


    $('#inventory_container').css('max-height', advntx.config.console.height + 'px');

    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, 
      advntx.vocabulary.adjectives, advntx.vocabulary.objects, advntx.state.objects);
    advntx.inventoryHandler = new InventoryHandler(advntx.state, advntx.initInventory);
    advntx.interpreter = new Interpreter(advntx);
    advntx.locationHandler = new LocationHandler(advntx.state);
    advntx.eventHandler = new EventHandler(advntx.state, advntx.vocabulary, advntx.initInventory);

    advntx.echo(advntx.messages.greetings.format(advntx.version)+'\n',undefined,'headline');

    advntx.initInventory();
    if (reset) {
      var startEvent = advntx.state.events['start_event'];
      advntx.eventHandler.executeEvent(startEvent, advntx.echo);
    }
    
    advntx.describeLocationEcho(advntx.state.location);

    if (advntx.htmlInitialized===undefined) {
      $('textarea.clipboard').attr('autocomplete', 'off');
      $('textarea.clipboard').attr('autocorrect', 'off');
      $('textarea.clipboard').attr('autocapitalize', 'off');
      $('textarea.clipboard').attr('spellcheck', 'off');
      $('#options').toggle();
      
      // set color scheme for terminal:
      $('#terminal').toggleClass('termcolor');
      $('.cmd').toggleClass('termcolor');
      advntx.htmlInitialized = true;
    }



    advntx.asyncRefocusTerminal();
  },

  toggleTerminalColors() {
    $('#terminal').toggleClass('termcolor');
    $('.cmd').toggleClass('termcolor');
    $('#terminal').toggleClass('inverted');
    $('.cmd').toggleClass('inverted');
    advntx.asyncRefocusTerminal();
  },

  refocusTerminal() {
    advntx.term.focus();
  },
  
  asyncRefocusTerminal() {
    window.setTimeout('advntx.refocusTerminal()', 250);
  },
  
  inventoryClick (item) {
    advntx.term.insert(' ' + item + ' ');
    advntx.asyncRefocusTerminal();
  },
  
  initInventory() {
    $('#inventory > .inventory_item').remove();
    if (advntx.state.inventory.length==0) {
      $('#inventory').append('<p class="inventory_item">'+advntx.messages.info_inventory_empty+'</p>');
    }
    for (var i = 0; i < advntx.state.inventory.length; i++) {
      var item = advntx.state.inventory[i];
      var itemName = getName(advntx.state.objects, item);
      var stateString = ' ' + advntx.inventoryHandler.getStateString(item);
      $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventoryClick(\'' + itemName + '\')" class="btn btn-secondary btn-sm inventory_button">' + itemName + stateString + '</button></p>');
    }
  }

};

window.periodicUpdates = function periodicUpdates() {
  advntx.state.seconds++;
  $('#time_element').text(advntx.state.seconds);
}


/** Global Initializations */
$(document).ready(function () {
  $('#btn_help').click(function () {
    advntx.term.exec(advntx.messages.verb_help, false);
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  });

  $('#btn_load_storage').click(function () {
    advntx.echo(advntx.messages.info_enter_savegame_name);
    advntx.term.insert(advntx.messages.verb_load + ' ');
    advntx.asyncRefocusTerminal();
  });

  $('#btn_list_storage').click(function () {
    advntx.term.exec(advntx.messages.verb_list);
    advntx.asyncRefocusTerminal();
  });

  $('#btn_save_storage').click(function () {
    advntx.echo(advntx.messages.info_enter_savegame_name);
    advntx.term.insert(advntx.messages.verb_save + ' ');
    advntx.asyncRefocusTerminal();
  });

  $('#btn_save').click(function () {
    $('#game_state').val(JSON.stringify(advntx.state));
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  });

  $('#btn_load').click(function () {
    advntx.state = $.parseJSON($('#game_state').val());
    advntx.term.exec('clear');
    advntx.initGame(false);

  });

  $('#btn_restart').click(function () {
    advntx.initGame(true);

  });
  window.setInterval('window.periodicUpdates()', 1000);
  advntx.initGame(true);
});

