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
  var loc = locations[location];
  console.log(loc);
  echo(loc.description, loc.color);
  var things = loc.things;
  if (things !== undefined && things.length>0) {
    var things_text = 'You see the following things:\n';
    for (var i=0;i<things.length;i++) {
      things_text+=things[i];
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




$('#btn_help').click(function () {
  term.exec('help', false);
  init_inventory();
  term.focus();
});


function inventory_click(item) {
  term.insert(item);
  term.focus();
}

function init_inventory() {
 $('#inventory > .inventory_item').remove();
  for (var i = 0; i < state.inventory.length; i++) {
    var item = state.inventory[i];
    $('#inventory').append('<p class="inventory_item"><button type="button" onclick="inventory_click(\''+item+'\')" class="btn btn-info btn-sm inventory_button">'+item+'</button></p>');
  }
}

$(function() {
  $('#inventory_container').css('height', CONFIG.console.height+'px');
  set_location(state.location);
  init_inventory();
});

