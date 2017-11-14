
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
  listObjects,
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
  echo (text, color) {
    if (color === undefined) {
      color = 'white';
    }
    advntx.term.echo(text, {
      finalize: function (div) {
        div.css('color', color);
      }
    });
  },
  
  describeLocationEcho (location_id, always_show_full_description) {
    var loc = advntx.locationHandler.getLocationById(location_id);
    if (!advntx.locationHandler.visited(location_id) || always_show_full_description) {
      advntx.echo(advntx.locationHandler.getLocationDescription(location_id), loc.color);
    } else {
      advntx.echo(getName(advntx.state.locations, location_id), loc.color);
    }

    var things = loc.objects;
    var persons = loc.persons;
    var message = advntx.messages.info_you_see;
    var things_message = listObjects(things, advntx.state.objects, advntx.inventoryHandler);
    var persons_message = listObjects(persons, advntx.state.persons, advntx.inventoryHandler);
    if (!isEmpty(persons_message) || !isEmpty(things_message)) {
      advntx.echo(message);
      advntx.echo(things_message);
      advntx.echo(persons_message);
    }
    
  },

  addToInventoryEcho (item) {
    advntx.inventoryHandler.addToInventory(item);
    advntx.initInventory();
  },

  initGame (refresh_json) {
    // version string, add to json calls to avoid browser caching:
    advntx.version = g_ver;
    if (refresh_json == true) {
      parseJson(advntx.initGameAsync, advntx);
    } else {
      advntx.initGameAsync(false);
    }
  },

  initGameAsync (reset) {
    advntx.term = $('#terminal').terminal(function (command) {
      var echo = advntx.echo;
      advntx.interpreter.interpret(command, advntx.describeLocationEcho, advntx.initInventory, advntx.echo, advntx.initGame);
    }, {
        greetings: advntx.messages.greetings.format(advntx.version),
        name: advntx.messages.name,
        prompt: advntx.config.console.prompt,
        height: advntx.config.console.height,
        completion: advntx.vocabulary.verbs.concat(advntx.vocabulary.directions).concat(advntx.vocabulary.prepositions).concat(getObjectNameArray(advntx.state.objects))
      });


    $('#inventory_container').css('max-height', advntx.config.console.height + 'px');

    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
    advntx.inventoryHandler = new InventoryHandler(advntx.state, advntx.initInventory);
    advntx.interpreter = new Interpreter(advntx);
    advntx.locationHandler = new LocationHandler(advntx.state);
    advntx.eventHandler = new EventHandler(advntx.state, advntx.vocabulary, advntx.initInventory);

    advntx.initInventory();
    if (reset) {
      var startEvent = advntx.state.events['start_event'];
      advntx.eventHandler.executeEvent(startEvent, advntx.echo);
    }

    advntx.describeLocationEcho(advntx.state.location);
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
    for (var i = 0; i < advntx.state.inventory.length; i++) {
      var item = advntx.state.inventory[i];
      var itemName = getName(advntx.state.objects, item);
      var stateString = ' ' + advntx.inventoryHandler.getStateString(item);
      $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventoryClick(\'' + itemName + '\')" class="btn btn-info btn-sm inventory_button">' + itemName + stateString + '</button></p>');
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
    advntx.term.exec('help', false);
    advntx.initInventory();
    advntx.asyncRefocusTerminal();
  });

  $('#btn_load_storage').click(function () {
    var retrievedObject = localStorage.getItem('advntx');
    if (retrievedObject != undefined) {
      advntx.state = JSON.parse(retrievedObject);
      advntx.echo('game loaded.');
      advntx.term.exec('clear');
      advntx.initGame(false);
    }

  });

  $('#btn_save_storage').click(function () {
    localStorage.setItem('advntx', JSON.stringify(advntx.state));
    advntx.echo('game saved.');
    advntx.initInventory();
    advntx.asyncRefocus();
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

