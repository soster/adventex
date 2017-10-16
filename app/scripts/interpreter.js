var Interpreter = {
    interpret : function(command) {
      var original = command;
      command = command.toLowerCase();
      if (command=='help') {
        return MESSAGE.console.help;
      } else if (command.startsWith('my name is ')) {
        var name = original.substr(11);
        return 'Your name is '+name;
      } else {
        
      }
      
      return MESSAGE.console.error.format(original);
  }
}