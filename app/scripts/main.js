var term = $('#terminal').terminal(function (command) {
  term.echo(Interpreter.interpret(command, set_location, add_to_inventory, echo));
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

function set_location(location) {
  state.location = location;
  var loc = state.locations[location];
  echo(loc.description, loc.color);
  var things = loc.things;
  if (things !== undefined && things.length>0) {
    var things_text = MESSAGE.info_you_see+'\n';
    for (var i=0;i<things.length;i++) {
      things_text+=get_name(state.things,things[i]);
      if (i<things.length-1)
        things_text+=', ';
    }
    echo(things_text);
  }
}

function add_to_inventory(item) {
  state.inventory.push(item);
  init_inventory();
}

function init_game(refresh_json) {
  if (refresh_json == true) {
    state.locations = JSON.parse(JSON.stringify(locations));
    state.things = JSON.parse(JSON.stringify(things));
    state.persons = JSON.parse(JSON.stringify(persons));
  }

  init_inventory();
  set_location(state.location);  
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
    console.log('name: '+item_name);
    $('#inventory').append('<p class="inventory_item"><button type="button" onclick="inventory_click(\''+item_name+'\')" class="btn btn-info btn-sm inventory_button">'+item+'</button></p>');
  }
}

function periodic_updates() {
  state.seconds++;
  $('#time_element').text(state.seconds);
}




/** Global Initializations */
$(function() {
  $('#inventory_container').css('height', CONFIG.console.height+'px');
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

