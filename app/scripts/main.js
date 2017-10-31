
'use strict';
var advntx = (function (my) {



my.echo = function(text, color) {
  if (color === undefined) {
    color = 'white';
  }
  my.term.echo(text, {
    finalize: function(div) {
      div.css('color', color);
    }
  });
};


my.describe_location_echo = function(location_id, always_show_full_description) {
  var loc = advntx.locationhandler.get_location_by_id(location_id);
  if (!advntx.locationhandler.visited(location_id) || always_show_full_description) {
    my.echo(advntx.locationhandler.get_location_description(location_id), loc.color);
  } else {
    my.echo(advntx.get_name(advntx.state.locations,location_id), loc.color);
  }
  
  var things = loc.objects;
  var persons = loc.persons;
  var message = my.messages.info_you_see;
  var things_message = advntx.list_objects(things, advntx.state.objects);
  var persons_message = advntx.list_objects(persons, advntx.state.persons);
  if (!isEmpty(persons_message) || !isEmpty(things_message)) {
    my.echo(message);
    my.echo(things_message);
    my.echo(persons_message);
  } 
  
};




my.add_to_inventory_echo = function(item) {
  advntx.inventoryhandler.add_to_inventory(item);
  my.init_inventory();
}

my.init_game = function(refresh_json) {
  if (refresh_json == true) {
    my.parse_json(my.init_game_async);
  } else {
    my.init_game_async();
  }
}

my.init_game_async = function () {
  my.term = $('#terminal').terminal(function (command) {
    var echo = my.echo;

    advntx.interpreter.interpret(command, my.describe_location_echo, my.add_to_inventory_echo, my.echo);
  }, {
      greetings: advntx.messages.greetings,
      name: advntx.messages.name,
      prompt: advntx.config.console.prompt,
      height: advntx.config.console.height
    });

  $('#inventory_container').css('max-height', advntx.config.console.height + 'px');



  advntx.parser.set(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
  my.init_inventory();
  var startEvent = advntx.state.events['start_event'];
  advntx.eventhandler.execute_event(startEvent,my.echo);
  my.describe_location_echo(advntx.state.location);
  my.async_refocus_terminal();
}




my.refocus_terminal = function(){
  my.term.focus();
}

my.async_refocus_terminal = function() {
  window.setTimeout('advntx.refocus_terminal()', 250);
}


my.inventory_click = function(item) {
  my.term.insert(' '+item+' ');
  my.async_refocus_terminal();
}

my.init_inventory = function() {
 $('#inventory > .inventory_item').remove();
  for (var i = 0; i < advntx.state.inventory.length; i++) {
    var item = advntx.state.inventory[i];
    var itemName = advntx.get_name(advntx.state.objects, item);
    var stateString = ' '+advntx.inventoryhandler.get_state_string(item);
    $('#inventory').append('<p class="inventory_item"><button type="button" onclick="advntx.inventory_click(\''+itemName+'\')" class="btn btn-info btn-sm inventory_button">'+itemName+stateString+'</button></p>');
  }
}

my.periodic_updates=function() {
  advntx.state.seconds++;
  $('#time_element').text(advntx.state.seconds);
}

return my;
}(advntx||{}));



/** Global Initializations */
$(function() {
  $('#btn_help').click(function () {
    advntx.term.exec('help', false);
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
  window.setInterval('advntx.periodic_updates()',1000);
  advntx.init_game(true);
});

