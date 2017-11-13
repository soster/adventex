
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
  setStateOfObject
} from 'app/scripts/helper.js'

import InventoryHandler from 'app/scripts/inventoryhandler.js'
import LocationHandler from 'app/scripts/locationhandler.js'
import EventHandler from 'app/scripts/eventhandler.js'
import Interpreter from 'app/scripts/interpreter.js'




window.advntx = (function (my) {
  var parser;
  var inventoryHandler;



  my.echo = function (text, color) {
    if (color === undefined) {
      color = 'white';
    }
    my.term.echo(text, {
      finalize: function (div) {
        div.css('color', color);
      }
    });
  };

  my.version = 14;


  my.describeLocationEcho = function (location_id, always_show_full_description) {
    var loc = advntx.locationHandler.getLocationById(location_id);
    if (!advntx.locationHandler.visited(location_id) || always_show_full_description) {
      my.echo(advntx.locationHandler.getLocationDescription(location_id), loc.color);
    } else {
      my.echo(getName(advntx.state.locations, location_id), loc.color);
    }

    var things = loc.objects;
    var persons = loc.persons;
    var message = my.messages.info_you_see;
    var things_message = listObjects(things, advntx.state.objects, advntx.inventoryHandler);
    var persons_message = listObjects(persons, advntx.state.persons, advntx.inventoryHandler);
    if (!isEmpty(persons_message) || !isEmpty(things_message)) {
      my.echo(message);
      my.echo(things_message);
      my.echo(persons_message);
    }
    
  };




  my.add_to_inventory_echo = function (item) {
    advntx.inventoryHandler.addToInventory(item);
    my.init_inventory();
  }

  my.init_game = function (refresh_json) {
    if (refresh_json == true) {
      parseJson(my.init_game_async, advntx);
    } else {
      my.init_game_async(false);
    }
  }

  my.init_game_async = function (reset) {
    my.term = $('#terminal').terminal(function (command) {
      var echo = my.echo;

      advntx.interpreter.interpret(command, my.describeLocationEcho, my.init_inventory, my.echo, my.init_game);
    }, {
        greetings: advntx.messages.greetings.format(my.version),
        name: advntx.messages.name,
        prompt: advntx.config.console.prompt,
        height: advntx.config.console.height
      });

    $('#inventory_container').css('max-height', advntx.config.console.height + 'px');

    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
    advntx.inventoryHandler = new InventoryHandler(advntx.state, advntx.init_inventory);
    advntx.interpreter = new Interpreter(advntx);
    advntx.locationHandler = new LocationHandler(advntx.state);
    advntx.eventHandler = new EventHandler(advntx.state, advntx.vocabulary, advntx.init_inventory);

    my.init_inventory();
    if (reset) {
      var startEvent = advntx.state.events['start_event'];
      advntx.eventHandler.executeEvent(startEvent, my.echo);
    }

    my.describeLocationEcho(advntx.state.location);
    my.async_refocus_terminal();
  }




  my.refocus_terminal = function () {
    my.term.focus();
  }

  my.async_refocus_terminal = function () {
    window.setTimeout('advntx.refocus_terminal()', 250);
  }


  my.inventory_click = function (item) {
    my.term.insert(' ' + item + ' ');
    my.async_refocus_terminal();
  }

  my.init_inventory = function () {
    $('#inventory > .inventory_item').remove();
    for (var i = 0; i < advntx.state.inventory.length; i++) {
      var item = advntx.state.inventory[i];
      var itemName = getName(advntx.state.objects, item);
      var stateString = ' ' + advntx.inventoryHandler.getStateString(item);
      $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventory_click(\'' + itemName + '\')" class="btn btn-info btn-sm inventory_button">' + itemName + stateString + '</button></p>');
    }
  }


  return my;
}(window.advntx || {}));


window.periodicUpdates = function periodicUpdates() {
  advntx.state.seconds++;
  $('#time_element').text(advntx.state.seconds);
}


/** Global Initializations */
$(document).ready(function () {
  $('#btn_help').click(function () {
    advntx.term.exec('help', false);
    advntx.init_inventory();
    advntx.async_refocus_terminal();
  });

  $('#btn_load_storage').click(function () {
    var retrievedObject = localStorage.getItem('advntx');
    if (retrievedObject != undefined) {
      advntx.state = JSON.parse(retrievedObject);
      advntx.echo('game loaded.');
      advntx.term.exec('clear');
      advntx.init_game(false);
    }

  });

  $('#btn_save_storage').click(function () {
    localStorage.setItem('advntx', JSON.stringify(advntx.state));
    advntx.echo('game saved.');
    advntx.init_inventory();
    advntx.async_refocus_terminal();
  });

  $('#btn_save').click(function () {
    $('#game_state').val(JSON.stringify(advntx.state));
    advntx.init_inventory();
    advntx.async_refocus_terminal();
  });

  $('#btn_load').click(function () {
    advntx.state = $.parseJSON($('#game_state').val());
    advntx.term.exec('clear');
    advntx.init_game(false);

  });

  $('#btn_restart').click(function () {
    advntx.init_game(true);

  });
  window.setInterval('window.periodicUpdates()', 1000);
  advntx.init_game(true);
});

