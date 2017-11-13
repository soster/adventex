
import 'bootstrap/css/bootstrap.css!';
import 'jquery.terminal/css/jquery.terminal.min.css!';

import $ from 'jquery';
import terminal from 'jquery.terminal';
import Parser from 'app/scripts/parser.js';
import parse_json from 'app/scripts/json.js';
import {
  check_synonyms,
  find_first_match,
  find_item_ids,
  find_item_ids_for_name,
  get_description,
  get_first_of_type,
  get_last_of_type,
  get_name,
  get_of_type,
  get_property,
  get_second_of_type,
  is_hidden,
  list_objects,
  set_state_of_object
} from 'app/scripts/helper.js'
import eventhandler from 'app/scripts/eventhandler.js'
import InventoryHandler from 'app/scripts/inventoryhandler.js'
import locationhandler from 'app/scripts/locationhandler.js'
import interpreter from 'app/scripts/interpreter.js'




var advntx = (function (my) {
  var parser;
  eventhandler(my);
  locationhandler(my);
  interpreter(my);
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


  my.describe_location_echo = function (location_id, always_show_full_description) {
    var loc = advntx.locationhandler.get_location_by_id(location_id);
    if (!advntx.locationhandler.visited(location_id) || always_show_full_description) {
      my.echo(advntx.locationhandler.get_location_description(location_id), loc.color);
    } else {
      my.echo(get_name(advntx.state.locations, location_id), loc.color);
    }

    var things = loc.objects;
    var persons = loc.persons;
    var message = my.messages.info_you_see;
    var things_message = list_objects(things, advntx.state.objects, advntx.inventoryHandler);
    var persons_message = list_objects(persons, advntx.state.persons, advntx.inventoryHandler);
    if (!isEmpty(persons_message) || !isEmpty(things_message)) {
      my.echo(message);
      my.echo(things_message);
      my.echo(persons_message);
    }

  };




  my.add_to_inventory_echo = function (item) {
    advntx.inventoryHandler.add_to_inventory(item);
    my.init_inventory();
  }

  my.init_game = function (refresh_json) {
    if (refresh_json == true) {
      parse_json(my.init_game_async, advntx);
    } else {
      my.init_game_async(false);
    }
  }

  my.init_game_async = function (reset) {
    my.term = $('#terminal').terminal(function (command) {
      var echo = my.echo;

      advntx.interpreter.interpret(command, my.describe_location_echo, my.init_inventory, my.echo, my.init_game);
    }, {
        greetings: advntx.messages.greetings.format(my.version),
        name: advntx.messages.name,
        prompt: advntx.config.console.prompt,
        height: advntx.config.console.height
      });

    $('#inventory_container').css('max-height', advntx.config.console.height + 'px');

    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
    advntx.inventoryHandler = new InventoryHandler(advntx.state, advntx.init_inventory);

    my.init_inventory();
    if (reset) {
      var startEvent = advntx.state.events['start_event'];
      advntx.eventhandler.execute_event(startEvent, my.echo);
    }

    my.describe_location_echo(advntx.state.location);
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
      var itemName = get_name(advntx.state.objects, item);
      var stateString = ' ' + advntx.inventoryHandler.get_state_string(item);
      $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventory_click(\'' + itemName + '\')" class="btn btn-info btn-sm inventory_button">' + itemName + stateString + '</button></p>');
    }
  }

  my.periodic_updates = function () {
    advntx.state.seconds++;
    $('#time_element').text(advntx.state.seconds);
  }

  return my;
}(advntx || {}));



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
  window.setInterval('advntx.periodic_updates()', 1000);
  advntx.init_game(true);
});

