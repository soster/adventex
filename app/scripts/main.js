var term = $('#terminal').terminal(function (command) {
  term.echo(Interpreter.interpret(command, describe_location_echo, add_to_inventory_echo, echo));
}, {
  greetings: MESSAGE.greetings,
  name: MESSAGE.name,
  prompt: CONFIG.console.prompt,
  height: CONFIG.console.height
});


function echo(text, color) {
  if (color === undefined) {
    color = 'white';
  }
  term.echo(text, {
    finalize: function(div) {
      div.css('color', color);
    }
  });
}


function describe_location_echo(location) {
  var loc = locationhandler.get_location_by_id(location);
  var description = locationhandler.get_location_description(location);
  echo(description, loc.color);
  var things = loc.things;
  var persons = loc.persons;
  var message = MESSAGE.info_you_see;
  var things_message = list_objects(things, state.things);
  var persons_message = list_objects(persons, state.persons);
  if (!isEmpty(persons_message) || !isEmpty(things_message)) {
    echo(message);
    echo(things_message);
    echo(persons_message);
  } 
  
}



function add_to_inventory_echo(item) {
  inventoryhandler.add_to_inventory(item);
  init_inventory();
}

function init_game(refresh_json) {
  if (refresh_json == true) {
    state.locations = JSON.parse(JSON.stringify(locations));
    state.things = JSON.parse(JSON.stringify(things));
    state.persons = JSON.parse(JSON.stringify(persons));
    state.events = JSON.parse(JSON.stringify(events));
  }

  init_inventory();
  var start_event = state.events['start_event'];
  eventhandler.execute_event(start_event);
  echo(start_event.description+'\n');
  describe_location_echo(state.location); 
  async_refocus_terminal();
}




function refocus_terminal() {
  term.focus();
}

function async_refocus_terminal() {
  window.setTimeout('refocus_terminal()', 250);
}


function inventory_click(item) {
  term.insert(' '+item+' ');
  async_refocus_terminal();
}

function init_inventory() {
 $('#inventory > .inventory_item').remove();
  for (var i = 0; i < state.inventory.length; i++) {
    var item = state.inventory[i];
    var item_name = get_name(state.things, item);
    $('#inventory').append('<p class="inventory_item"><button type="button" onclick="inventory_click(\''+item_name+'\')" class="btn btn-info btn-sm inventory_button">'+item_name+'</button></p>');
  }
}

function periodic_updates() {
  state.seconds++;
  $('#time_element').text(state.seconds);
}




/** Global Initializations */
$(function() {
  $('#inventory_container').css('max-height', CONFIG.console.height+'px');
  term.wrap(false);
  $('#btn_help').click(function () {
    term.exec('help', false);
    init_inventory();
    async_refocus_terminal();
  });
  
  $('#btn_save').click(function () {
    $('#game_state').val(JSON.stringify(state));
    init_inventory();
    async_refocus_terminal();
  });
  
  $('#btn_load').click(function () {
    state = $.parseJSON($('#game_state').val());
    term.exec('clear');
    init_game(false);
    
  });
  window.setInterval('periodic_updates()',1000);
  init_game(true);
});

