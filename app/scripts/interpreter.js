var Interpreter = {
  interpret: function (command, init_location, echo) {
    var original = command;
    command = command.toLowerCase();
    if (command == 'help') {
      echo(MESSAGE.console.help);
    } else {
      var words = parser.parse(command);
      console.log(words['directions']);
      if (words['verbs'].indexOf('go') != -1 && words['directions'] !== undefined) {
        var direction = words['directions'][0];
        var location = locations[state.location];
        console.log(location.connections);
        console.log(location.connections[direction]);
        if (location.connections[direction] !== undefined) {
          var new_location = location.connections[direction];
          console.log("new: "+new_location);
          init_location(new_location);
        }
      }
    }
  }
}