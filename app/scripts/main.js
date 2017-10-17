var term = $('#terminal').terminal(function (command) {
  this.echo(Interpreter.interpret(command, init_location, echo));
}, {
  greetings: MESSAGE.console.greetings,
  name: MESSAGE.name,
  prompt: CONFIG.console.prompt,
  height: CONFIG.console.height
});


function init_location(location) {
  state.locaction = location;
  var loc = locations[location];
  console.log(loc);
  echo(loc.description, loc.color);
}

function echo(text, color) {
  if (color === undefined) {
    color = 'white';
  }


  term.echo(text, {
    finalize: function(div) {
      div.css("color", color);
    }
  });
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
  init_location(state.location);
});

