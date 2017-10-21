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
  describe_location(location);
}

function describe_location(location) {
  var loc = state.locations[location];
  echo(loc.description+'\n', loc.color);
  var things = loc.things;
  var persons = loc.persons;
  var message = MESSAGE.info_you_see;
  var things_message = list_stuff(things, state.things);
  var persons_message = list_stuff(persons, state.persons);
  if (persons_message != '' || things_message != '') {
    echo(message);
    echo(things_message);
    echo(persons_message);
  } 
  
}

function list_stuff(list, list_of_all) {
  var message = '';
  if (list !== undefined && list.length>0) {
    for (var i=0;i<list.length;i++) {
      message+=get_name(list_of_all,list[i]);
      if (i<list.length-1)
      message+=', ';
    }
    message+='\n';
  } 
  return message;
  
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
    state.events = JSON.parse(JSON.stringify(events));
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

